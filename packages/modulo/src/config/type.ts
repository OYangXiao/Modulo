import type { preset_config } from "./presets.ts";

export type GLOBAL_CONFIG = typeof preset_config;

export interface EnvExternalUrl {
  dev: string;
  prd: string;
}

export type ConfigExternalUrl =
  | EnvExternalUrl
  | string;

export interface ImportExternal {
  url: ConfigExternalUrl;
  importName?: string | string[];
  global?: string; // script注入时使用的全局变量名
  preset?: string;
}

export type ExternalLibs = {
  [name: string]:
    | ImportExternal
    | EnvExternalUrl
    | string;
};

export interface USER_CONFIG {
  extends?: string;
  analyze?: boolean;
  define?: GLOBAL_CONFIG["define"];
  dev_server?: Partial<GLOBAL_CONFIG["dev_server"]>;
  externals?: GLOBAL_CONFIG["externals"];
  html?: Partial<GLOBAL_CONFIG["html"]>;
  input?: Partial<GLOBAL_CONFIG["input"]>;
  minify?: Partial<GLOBAL_CONFIG["minify"]> | boolean;
  output?: Partial<GLOBAL_CONFIG["output"]>;
  ui_lib?: Partial<GLOBAL_CONFIG["ui_lib"]>;
  alias?: GLOBAL_CONFIG["alias"];
  url?: Partial<GLOBAL_CONFIG["url"]>;
  webhost?: GLOBAL_CONFIG["webhost"];
  autoExternal?: boolean;
  externalsType?: "importmap" | "script";
}
