import picocolors from "picocolors";
import { star_line } from "../../initiator/modify-scripts.ts";
import { preset_alias } from "../preset/alias.ts";
import { preset_config } from "../preset/index.ts";
import type { USER_CONFIG } from "../type.ts";
import { example_externals } from "./example-externals.ts";

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
      title: "Modulo Page",
      meta: {
        viewport:
          "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover",
      },
      root: "app",
    },
    externals: example_externals.filter(
      (item) => item.preset === preset || !item.preset
    ),
    dev_server: preset_config.dev_server,
  } as USER_CONFIG;
}

export const default_config_file_name = "modulo.config.json";
