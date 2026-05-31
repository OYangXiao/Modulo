import { type EnvExternalUrl, type ConfigExternalUrl, type ImportExternal } from "../config/type.ts";
export declare function is_string(data: unknown): data is string;
export declare function is_true_string(data: unknown): data is string;
export declare function is_record(data: unknown): data is Record<string, unknown>;
export declare function is_env_external(data: unknown): data is EnvExternalUrl;
export declare function is_url_config(data: unknown): data is ConfigExternalUrl;
export declare function is_import_external(data: unknown): data is ImportExternal;
