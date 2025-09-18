import { is_record, is_string } from "../type/guard.ts";

export interface UmdExternalUrl {
  umd: string;
}

export interface EsmExternalUrl {
  esm: string;
}

export function is_umd_url(data: unknown): data is UmdExternalUrl {
  return is_record(data) && is_string(data.umd);
}

export function is_esm_url(data: unknown): data is EsmExternalUrl {
  return is_record(data) && is_string(data.esm);
}

export type ModuleTypedExternalUrl = UmdExternalUrl | EsmExternalUrl;

export function is_module_typed_external_url(
  data: unknown
): data is ModuleTypedExternalUrl {
  return is_umd_url(data) || is_esm_url(data);
}

export interface EnvExternalUrl {
  dev: ModuleTypedExternalUrl | string;
  prd: ModuleTypedExternalUrl | string;
}

export function is_env_external(data: unknown): data is EnvExternalUrl {
  return (
    is_record(data) &&
    (is_string(data.dev) || is_module_typed_external_url(data.dev)) &&
    (is_string(data.prd) || is_module_typed_external_url(data.prd))
  );
}

export type ConfigExternalUrl =
  | ModuleTypedExternalUrl
  | EnvExternalUrl
  | string;

export interface ImportExternal {
  url: ConfigExternalUrl;
  importName?: string | string[];
  preset?: string;
}

export function is_url_config(data: unknown): data is ConfigExternalUrl {
  return (
    is_module_typed_external_url(data) ||
    is_env_external(data) ||
    is_string(data)
  );
}

export function is_import_external(data: unknown): data is ImportExternal {
  // 没有global的一概作为import的依赖
  return is_record(data) && is_url_config(data.url) && !is_string(data.global);
}

export type ExternalLibs = {
  [name: string]:
    | ImportExternal
    | ModuleTypedExternalUrl
    | EnvExternalUrl
    | string;
};
