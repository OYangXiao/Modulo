import type { OutputConfig } from "@rsbuild/core";
import type { LibExternal } from "../example/example-externals.ts";
import { preset_dev_server_config } from "./dev-server.ts";
import { preset_input_dirs, preset_output_dirs } from "./dirs.ts";
import { default_html_config } from "./html.ts";
import { preset_ui_libs } from "./libs.ts";
import { preset_minify_config } from "./minify.ts";
import { preset_url_config } from "./url.ts";

export const preset_config = {
  analyze: false, // 是否执行bundleAnalyze
  define: {} as Record<string, string | boolean | number>, // 配置全局变量，用于打包时替换代码中的全局变量
  dev_server: preset_dev_server_config,
  externals: [] as LibExternal[],
  html: default_html_config,
  input: preset_input_dirs,
  minify: preset_minify_config as OutputConfig["minify"], // 是否压缩产物，同时进行mangle
  output: preset_output_dirs,
  ui_lib: preset_ui_libs,
  url: preset_url_config,
  alias: {} as Record<string, string>,
};
