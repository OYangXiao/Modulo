import { type PluginReactOptions } from "@rsbuild/plugin-react";
import { type PluginVueOptions } from "@rsbuild/plugin-vue2";
import type { GLOBAL_CONFIG } from "../config/type.ts";
export declare function framework_plugin(global_config: GLOBAL_CONFIG, options?: PluginVueOptions | PluginReactOptions): import("@rsbuild/core").RsbuildPlugin;
