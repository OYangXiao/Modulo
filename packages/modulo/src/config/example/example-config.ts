import picocolors from "picocolors";
import { star_line } from "../../initiator/modify-scripts.ts";
import { preset_alias } from "../preset/alias.ts";
import { preset_config } from "../preset/index.ts";
import type { USER_CONFIG } from "../type.ts";
import { common_example_externals, presets } from "./example-externals.ts";

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
    externals: preset ? presets[preset] : common_example_externals,
  } as USER_CONFIG;
}

export const default_config_file_name = "modulo.config.json";
