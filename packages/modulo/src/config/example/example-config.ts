import { get_args } from "../../args/index.ts";
import { preset_config } from "../preset/index.ts";
import type { USER_CONFIG } from "../type.ts";
import { example_externals } from "./example-externals.ts";
//
export function get_example_config() {
  const args = get_args();
  return {
    // 提供一些常用的配置
    dev_server: preset_config.dev_server,
    externals: example_externals.filter(
      (item) => item.preset === args.create_config.preset || !item.preset
    ),
    html: {
      title: "Modulo Page",
      meta: {
        viewport:
          "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover",
      },
      root: "app",
    },
    input: {
      modules: preset_config.input.modules,
      pages: preset_config.input.pages,
    },
    output: {
      filenameHash: true,
    },
    url: {
      base: "/",
    },
  } as USER_CONFIG;
}

export const default_config_file_name = "modulo.config.json";
