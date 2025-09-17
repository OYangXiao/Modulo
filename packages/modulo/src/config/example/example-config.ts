import picocolors from "picocolors";
import { star_line } from "../../initiator/modify-scripts.ts";
import { preset_alias } from "../preset/alias.ts";
import { preset_config } from "../preset/index.ts";
import type { USER_CONFIG } from "../type.ts";
import { example_externals } from "./example-externals.ts";
import { is_module_typed_external_url } from "../externals.ts";

export function get_example_config(preset?: "react" | "vue" | undefined) {
  console.log(
    picocolors.magenta(
      `\n${star_line}\n默认配置文件中的externals内容为推荐内容\n请注意手动替换配置文件中externals的url，以保证符合项目需求\n如果不需要externals部分依赖，也可以将他们从列表中删除\n${star_line}\n`
    )
  );
  return {
    // 提供一些常用的配置
    input: preset_config.input,
    output: {
      filenameHash: true,
    },
    url: {
      base: "/",
    },
    alias: preset_alias,
    html: {
      root: "app",
      title: "Modulo Page",
      meta: {},
      tags: [
        {
          tag: "script",
          attrs: {
            src: "/packages/webhost/dist/webhost.system.js",
          },
          append: false,
          publicPath: false,
        },
      ],
    },
    dev_server: {
      proxy: preset_config.dev_server.proxy,
    },
    externals: Object.fromEntries(
      Object.entries(example_externals)
        // 根据初始化config时候是vue还是react过滤预设的externals，避免产生太多配置项
        .filter(
          ([_, external]) =>
            (external as any).preset === preset || !(external as any).preset
        )
        .map(([name, external]) => {
          // preset字段用于区分预设的externals，暴露在配置文件里无意义，删掉
          if ((external as any).preset) {
            delete (external as any).preset;
            // 如果配置项只有一个url，则省略这个key，减少配置文件长度
            const keys = Object.keys(external);
            if (keys.length === 1 && keys[0] === "url") {
              return [name, (external as any).url];
            }
          }
          return [name, external];
        })
    ),
  } as USER_CONFIG;
}

export const default_config_file_name = "modulo.config.json";
