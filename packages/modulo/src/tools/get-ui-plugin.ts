import { type PluginReactOptions, pluginReact } from "@rsbuild/plugin-react";
import { type PluginVueOptions, pluginVue2 } from "@rsbuild/plugin-vue2";
import { get_global_config, get_packagejson } from "../config/index.ts";
import { get_framework_name } from "./get-framework-name.ts";
import { PANIC_IF } from "./panic.ts";
import type { ModuloArgs_Pack } from "../args/index.ts";

export function framework_plugin(
  args: ModuloArgs_Pack,
  options?: PluginVueOptions | PluginReactOptions
) {
  const { dependencies } = get_packagejson();
  const framework_name = get_framework_name();

  // 必须使用指定版本号的ui库，以优化代码产出
  const version = dependencies[framework_name];
  const global_config = get_global_config(args);
  PANIC_IF(
    global_config.ui_lib[framework_name] !== version,
    "package.json中只允许使用固定版本号, 并且只支持vue-2.7.16和react-17.0.2"
  );
  return framework_name === "vue" ? pluginVue2(options) : pluginReact(options);
}
