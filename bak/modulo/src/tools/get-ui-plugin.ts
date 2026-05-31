import { type PluginReactOptions, pluginReact } from "@rsbuild/plugin-react";
import { type PluginVueOptions, pluginVue2 } from "@rsbuild/plugin-vue2";
import { get_packagejson } from "../config/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
import { get_framework_name } from "./get-framework-name.ts";
import { PANIC_IF } from "./panic.ts";
import type { ModuloArgs_Pack } from "../args/index.ts";
import semver from "semver";

export function framework_plugin(
	global_config: GLOBAL_CONFIG,
	options?: PluginVueOptions | PluginReactOptions,
) {
	const { dependencies } = get_packagejson();
	const framework_name = get_framework_name();

	// 必须使用指定版本号的ui库，以优化代码产出
	const version = dependencies[framework_name];

	const allowed_versions = [
		global_config.ui_lib.vue2,
		global_config.ui_lib.react19,
	];

	const is_valid = allowed_versions.some((allowed) => {
		const min_version = semver.minVersion(version);
		return min_version && semver.satisfies(min_version, `^${allowed}`);
	});

	PANIC_IF(
		!is_valid,
		`package.json中只允许使用固定版本号, 并且只支持vue-2.7.16, react-19.2.4 (当前版本: ${version})`,
	);
	return framework_name === "vue"
		? pluginVue2(options as any)
		: pluginReact(options as any);
}
