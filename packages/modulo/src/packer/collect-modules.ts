import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import picocolors from "picocolors";
import ts from "typescript";
import { debug_log } from "../tools/log.ts";
import { get_framework_name } from "../tools/get-framework-name.ts";
import { get_directories, find_entry_file, exists } from "../tools/file.ts";
import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";

async function load_html_config(
	dir_path: string,
): Promise<Record<string, unknown>> {
	const json_path = resolve(dir_path, "html.json");
	if (exists(json_path)) {
		const content = await readFile(json_path, "utf8");
		const data = JSON.parse(content) as unknown;
		return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
	}

	const js_path = resolve(dir_path, "html.js");
	if (exists(js_path)) {
		const mod: any = await import(`${pathToFileURL(js_path).href}?t=${Date.now()}`);
		const data = mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
		return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
	}

	const ts_path = resolve(dir_path, "html.ts");
	if (exists(ts_path)) {
		const source = await readFile(ts_path, "utf8");
		const { outputText } = ts.transpileModule(source, {
			compilerOptions: {
				target: ts.ScriptTarget.ES2020,
				module: ts.ModuleKind.ESNext,
			},
			fileName: ts_path,
		});
		const mod: any = await import(
			`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`,
		);
		const data = mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
		return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
	}

	return {};
}

/**
 * 收集模块入口文件
 * 扫描指定目录下的子目录，查找符合规则的入口文件（index/main/同名文件）
 *
 * @param args CLI 参数
 * @param kind 模块类型（page 或 module）
 * @returns 模块名到入口文件路径的映射对象，如果未找到任何模块则返回 undefined
 */
export async function collect_modules(
	args: ModuloArgs_Pack,
	kind: "page" | "module",
	global_config: GLOBAL_CONFIG,
){
	const framework_name = get_framework_name();
	const module_path = global_config.input[`${kind}s`];
	const isExist = exists(module_path);

	debug_log(
		picocolors.blue("check module_path"),
		module_path,
		isExist ? "exists" : "NOT exists",
	);

	if (!isExist) {
		return undefined;
	}

	// 基础候选文件名
	const baseCandidates = ["index", "main"];
	// 扩展名列表
	const extensions = [".ts", ".tsx", ".js", ".jsx"];
	// Vue 特有扩展名
	if (framework_name === "vue") {
		extensions.unshift(".vue");
	}

	const module_entries = await Promise.all(
		get_directories(module_path).map(async (dirName) => {
			const dir_path = resolve(module_path, dirName);

			// 构建候选文件名列表，包含目录名
			const candidates = [...baseCandidates, dirName];

			// 查找入口文件
			const entry_file_path = find_entry_file(dir_path, candidates, extensions);

			debug_log("found entry", dirName, entry_file_path || "NOT FOUND");

			let html_content: Record<string, unknown> = {};
			if (entry_file_path) {
				html_content = await load_html_config(dir_path);
			}

			return [dirName, { entry_dir: dir_path, entry: entry_file_path, html_config: html_content }] as [
				string,
				{ entry_dir: string; entry: string; html_config: Record<string, unknown> },
			];
		}),
	);

	const valid_entries = module_entries.filter(
		(entry): entry is [string, { entry_dir: string; entry: string; html_config: Record<string, unknown> }] =>
			!!entry[1].entry,
	);

	return valid_entries.length > 0
		? Object.fromEntries(valid_entries)
		: undefined;
}
