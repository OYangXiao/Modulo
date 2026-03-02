import { resolve } from "node:path";
import picocolors from "picocolors";
import { get_global_config } from "../config/index.ts";
import { debug_log } from "../tools/debug-log.ts";
import { get_framework_name } from "../tools/get-framework-name.ts";
import { get_directories, find_entry_file, exists } from "../tools/file.ts";
import type { ModuloArgs_Pack } from "../args/index.ts";

/**
 * 收集模块入口文件
 * 扫描指定目录下的子目录，查找符合规则的入口文件（index/main/同名文件）
 * 
 * @param args CLI 参数
 * @param kind 模块类型（page 或 module）
 * @returns 模块名到入口文件路径的映射对象，如果未找到任何模块则返回 undefined
 */
export function collect_modules(
  args: ModuloArgs_Pack,
  kind: "page" | "module"
): Record<string, string> | undefined {
  const global_config = get_global_config(args);
  const framework_name = get_framework_name();
  const module_path = global_config.input[`${kind}s`];
  const isExist = exists(module_path);
  
  debug_log(
    picocolors.blue("check module_path"),
    module_path,
    isExist ? "exists" : "NOT exists"
  );

  if (!isExist) {
    return undefined;
  }

  // 基础候选文件名
  const baseCandidates = ["index", "main"];
  // 扩展名列表
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  // Vue 特有扩展名
  if (framework_name === "vue") {
    extensions.unshift(".vue");
  }

  // 解析目录下的所有模块
  const module_entries = get_directories(module_path)
    .map((dirName) => {
      const dir_path = resolve(module_path, dirName);
      
      // 构建候选文件名列表，包含目录名
      const candidates = [...baseCandidates, dirName];
      
      // 查找入口文件
      const entry_file_path = find_entry_file(dir_path, candidates, extensions);
      
      debug_log("found entry", dirName, entry_file_path || "NOT FOUND");
      
      return [dirName, entry_file_path];
    })
    // 没有找到入口的就不管
    .filter((entry): entry is [string, string] => !!entry[1]);

  return module_entries.length > 0
    ? Object.fromEntries(module_entries)
    : undefined;
}
