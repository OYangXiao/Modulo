import type { preset_config } from "./preset/index.ts";

export type GLOBAL_CONFIG = typeof preset_config;

export interface USER_CONFIG {
  analyze?: boolean;
  define?: GLOBAL_CONFIG["define"];
  dev_server?: Partial<GLOBAL_CONFIG["dev_server"]>;
  externals?: GLOBAL_CONFIG["externals"];
  html?: Partial<GLOBAL_CONFIG["html"]>;
  input?: Partial<GLOBAL_CONFIG["input"]>;
  minify?: Partial<GLOBAL_CONFIG["minify"]> | boolean;
  output?: Partial<GLOBAL_CONFIG["output"]>;
  ui_lib?: Partial<GLOBAL_CONFIG["ui_lib"]>;
}
