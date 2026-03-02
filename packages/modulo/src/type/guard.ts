import {
	type EnvExternalUrl,
	type ConfigExternalUrl,
	type ImportExternal,
} from "../config/type.ts";

export function is_string(data: unknown): data is string {
	return typeof data === "string";
}

export function is_true_string(data: unknown): data is string {
	return typeof data === "string" && !!data;
}

export function is_record(data: unknown): data is Record<string, unknown> {
	return !!data && typeof data === "object";
}

export function is_env_external(data: unknown): data is EnvExternalUrl {
	return is_record(data) && is_string(data.dev) && is_string(data.prd);
}

export function is_url_config(data: unknown): data is ConfigExternalUrl {
	return is_env_external(data) || is_string(data);
}

export function is_import_external(data: unknown): data is ImportExternal {
	// 没有global的一概作为import的依赖
	return is_record(data) && is_url_config(data.url) && !is_string(data.global);
}
