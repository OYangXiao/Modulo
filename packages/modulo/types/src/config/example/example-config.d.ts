import { preset_ui_libs } from "../presets.ts";
import type { USER_CONFIG } from "../type.ts";
export declare function get_example_config(preset?: keyof typeof preset_ui_libs | undefined): USER_CONFIG;
export declare const default_config_file_name = "modulo.config.ts";
