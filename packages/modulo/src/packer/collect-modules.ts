import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import picocolors from "picocolors";
import { get_global_config } from "../config/index.ts";
import { debug_log } from "../tools/debug-log.ts";
import { get_framework_name } from "../tools/get-framework-name.ts";
import type { ModuloArgs_Pack } from "../args/index.ts";

export function collect_modules(
  args: ModuloArgs_Pack,
  kind: "page" | "module"
) {
  const global_config = get_global_config(args);
  const framework_name = get_framework_name();
  const module_path = global_config.input[`${kind}s`];
  const exist = existsSync(module_path);
  debug_log(
    picocolors.blue("check module_path"),
    module_path,
    exist ? "exists" : "NOT exists"
  );
  // 解析目录下的所有模块
  const module_entries = !exist
    ? []
    : readdirSync(module_path, { withFileTypes: true })
        .filter((item) => {
          debug_log(
            "checking module is directory",
            item.name,
            item.isDirectory()
          );
          return item.isDirectory();
        })
        // 每个模块都要求以index或者main或者文件夹同名命名
        .map((dirent) => {
          const dir_path = resolve(module_path, dirent.name);
          const entry_file_path = [
            resolve(dir_path, "index.ts"),
            resolve(dir_path, "index.tsx"),
            resolve(dir_path, "index.js"),
            resolve(dir_path, "index.jsx"),
            resolve(dir_path, "main.ts"),
            resolve(dir_path, "main.tsx"),
            resolve(dir_path, "main.js"),
            resolve(dir_path, "main.jsx"),
            // vue组件常常用vue文件作为入口，因此优先级高于同名ts和tsx文件
            ...(framework_name === "vue"
              ? [
                  resolve(dir_path, "index.vue"),
                  resolve(dir_path, "main.vue"),
                  resolve(dir_path, `${dirent.name}.vue`),
                ]
              : []),
            resolve(dir_path, `${dirent.name}.ts`),
            resolve(dir_path, `${dirent.name}.tsx`),
            resolve(dir_path, `${dirent.name}.js`),
            resolve(dir_path, `${dirent.name}.jsx`),
          ].find((path) => {
            const exists = existsSync(path);
            debug_log(
              "checking entry candidate",
              `${path} ${picocolors[exists ? "green" : "red"](
                `exists - ${exists}`
              )}`
            );
            return exists;
          });
          debug_log("found entry", entry_file_path);
          return [dirent.name, entry_file_path];
        })
        // 没有找到入口的就不管
        .filter((entry): entry is [string, string] => !!entry[1]);

  return module_entries.length > 0
    ? Object.fromEntries(module_entries)
    : undefined;
}
