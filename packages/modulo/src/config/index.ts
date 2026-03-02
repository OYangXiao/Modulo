import { resolve } from "node:path";
import { cwd } from "node:process";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { debug_log } from "../tools/log.ts";
import { resolve_and_read } from "../tools/file.ts";
import { jsonparse } from "../tools/json.ts";
import { merge_user_config } from "../tools/merge-user-config.ts";
import { PANIC_IF } from "../tools/panic.ts";
import { preset_config, preset_minify_config } from "./presets.ts";
import type { GLOBAL_CONFIG, USER_CONFIG } from "./type.ts";

/**
 * 命令启动时候的目录作为根目录
 */
export const root = cwd();

interface PackageJson {
	name: string;
	dependencies: Record<string, string>;
	scripts: undefined | Record<string, string>;
}
/**
 * 读取并缓存 package.json 内容
 * @returns package.json 的对象
 * @throws 当文件不存在或缺少 name 字段时抛出异常
 */
let packagejson = null as PackageJson | null;
export function get_packagejson(customRoot: string = root) {
	if (!packagejson) {
		// biome-ignore lint/style/noNonNullAssertion: <panic if content nullable>
		packagejson = jsonparse<PackageJson>(
			resolve_and_read(customRoot, "package.json"),
		)!;
		PANIC_IF(!packagejson, "根目录下没有package.json");
		PANIC_IF(!packagejson.name, "package.json缺少name字段");
	} else if (customRoot !== root) {
		// 如果传入了自定义 root，强制重新读取，不使用缓存
		const newPackageJson = jsonparse<PackageJson>(
			resolve_and_read(customRoot, "package.json"),
		)!;
		PANIC_IF(!newPackageJson, "根目录下没有package.json");
		PANIC_IF(!newPackageJson.name, "package.json缺少name字段");
		return newPackageJson;
	}
	return packagejson;
}

let global_config: GLOBAL_CONFIG;

/**
 * 获取全局配置（单例模式）
 *
 * 1. 读取用户配置文件
 * 2. 处理 extends 继承逻辑
 * 3. 与默认配置进行合并
 * 4. 处理路径别名、环境变量、目录解析等
 *
 * @param args CLI 参数
 * @returns 合并后的全局配置对象
 */
export async function get_global_config(
	args: ModuloArgs_Pack,
): Promise<GLOBAL_CONFIG> {
	if (!global_config) {
		/**
		 * 读取配置文件
		 */
		let configPath = args.pack.config;

		// Find config file if not specified
		if (!configPath) {
			const candidates = [
				"modulo.config.ts",
				"modulo.config.js",
				"modulo.config.json",
			];
			for (const f of candidates) {
				const p = resolve(root, f);
				if (existsSync(p)) {
					configPath = p;
					break;
				}
			}
		}

		if (!configPath) {
			throw new Error("根目录下没有配置文件 (modulo.config.ts/js/json)");
		}

		const resolvedConfigPath = resolve(root, configPath);

		// Load config using native import()
		// Support .ts files via Node.js native support (requires Node.js v24+ or experimental flags)
		let user_config: USER_CONFIG;
		try {
			const fileUrl = pathToFileURL(resolvedConfigPath).href;
			const mod = await import(fileUrl);
			user_config = mod.default || mod;
		} catch (e) {
			console.error(`无法加载配置文件: ${resolvedConfigPath}`);
			throw e;
		}

		PANIC_IF(!user_config, "根目录下没有配置文件");
		debug_log("input user config", user_config);

		if (user_config.extends) {
			const extend_config_path = resolve(root, user_config.extends);
			try {
				const extend_fileUrl = pathToFileURL(extend_config_path).href;
				const extend_mod = await import(extend_fileUrl);
				const extend_config = extend_mod.default || extend_mod;
				debug_log("extend config", extend_config);
				merge_user_config(preset_config, extend_config);
			} catch (e) {
				console.error(`无法加载继承的配置文件: ${extend_config_path}`);
				throw e;
			}
		}

		/**
		 * 将配置文件和默认配置合并
		 */
		merge_user_config(preset_config, user_config);
		const _config: GLOBAL_CONFIG = preset_config;

		/**
		 * src目录
		 */
		const src = resolve(root, _config.input.src);
		const input = {
			modules: resolve(src, _config.input.modules),
			pages: resolve(src, _config.input.pages),
			src: src,
		};

		/**
		 * dist目录
		 */
		const dist = resolve(root, _config.output.dist);
		const output = {
			..._config.output,
			dist: dist,
			modules: resolve(dist, _config.output.modules),
			pages: resolve(dist, _config.output.pages),
		};

		/**
		 * 允许定制template
		 */
		const html = _config.html?.template
			? { ..._config.html, template: resolve(root, _config.html.template) }
			: _config.html;

		/**
		 * 所有define的值都序列化以正确传入
		 */
		// process.env.NODE_ENV 由构建工具自动注入，不需要手动注入，否则会产生冲突警告
		const define = Object.fromEntries(
			Object.entries({
				..._config.define,
				"import.meta.env.MOUNT_ID": _config.html.root,
			}).map(([k, v]) => [k, JSON.stringify(v)]),
		);
		debug_log("当前模式", process.env.NODE_ENV);

		/**
		 * minify代码的开关
		 */
		const minify =
			_config.minify === true ? preset_minify_config : _config.minify;

		/**
		 * alias 允许使用{src}作为占位符，取值来自input.src
		 */
		const alias = Object.fromEntries(
			Object.entries(_config.alias).map(([k, v]) => [
				k,
				v.replace("{input.src}", input.src),
			]),
		);

		global_config = {
			..._config,
			define,
			html,
			input,
			minify,
			output,
			alias,
		};
		debug_log("global config", global_config);
	}
	return global_config;
}
