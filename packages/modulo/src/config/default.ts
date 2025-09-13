import { default_dev_server_config } from './defaults/dev-server.ts';
import { default_externals } from './defaults/externals.ts';
import { default_html_config } from './defaults/html.ts';
import { default_input_dirs, default_output_dirs } from './defaults/input-output-dirs.ts';
import { default_ui_libs } from './defaults/ui-libs.ts';
import { default_url_config } from './defaults/url.ts';

export const default_config = {
  analyze: false, // 是否执行bundleAnalyze
  define: {} as Record<string, string | boolean | number>, // 配置全局变量，用于打包时替换代码中的全局变量
  dev_server: default_dev_server_config,
  externals: default_externals,
  html: default_html_config,
  input: default_input_dirs,
  minify: undefined as boolean | undefined, // 是否压缩产物，同时进行mangle
  output: default_output_dirs,
  ui_lib: default_ui_libs,
  url: default_url_config,
};

export const default_config_file_name = 'modulo.config.json';
