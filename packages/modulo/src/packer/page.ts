import { resolve } from "node:path";
import { createRsbuild, defineConfig, RsbuildConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import picocolors from "picocolors";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { get_global_config } from "../config/index.ts";
import {
	get_package_root,
	find_workspace_root,
} from "../tools/find-path-root.ts";
import { framework_plugin } from "../tools/get-ui-plugin.ts";
import { prepare_config } from "./prepare.ts";
import { AutoExternalPlugin } from "./auto-external-plugin.ts";

/**
 * 执行页面（page）打包
 *
 * 使用 Rsbuild 构建单页应用或多页应用。
 *
 * @param args CLI 参数
 */
export async function page_pack(args: ModuloArgs_Pack) {
	const config = await get_global_config(args);

	const { entries, externals } = await prepare_config(args, "page", config);

	if (!entries) {
		return;
	}

	const workspaceRoot = find_workspace_root(process.cwd());
	const get_entry_html_config = (entryName: string) => {
		const raw = entries[entryName]?.html_config as RsbuildConfig['html'];
		return typeof raw === "object"? raw : {};
	};

	const rsbuildConfig = defineConfig({
		source: {
			define: config.define,
			entry: Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, entry.entry])),
		},
		plugins: [framework_plugin(config), pluginLess()],
		tools: {
			rspack: {
				experiments: {
					outputModule: config.externalsType === "importmap" ? true : undefined,
				},
				plugins: [
					// @ts-ignore Rspack 插件类型兼容问题
					new AutoExternalPlugin(args, config),
				],
			},
		},
		output: {
			assetPrefix: config.url.cdn || config.url.base,
			distPath: {
				root: config.output.distPath,
			},
			externals,
			filenameHash: config.output.filenameHash,
			legalComments: "none",
			minify: config.minify,
		},
		html: {
			meta({ value, entryName }) {
				const entryHtml = get_entry_html_config(entryName);
				const merged: any = { ...value };
				for (const [key, val] of [...Object.entries(config.html.meta || {}), ...Object.entries(entryHtml.meta || {})]) {
					if (val !== undefined) {
						merged[key] = val;
					}
				}
				return merged as any;
			},
			title({ entryName }) {
				const entryHtml = get_entry_html_config(entryName);
				return entryHtml.title as string  || config.html.title || "";
			},
			mountId: config.html.root,
			scriptLoading: config.externalsType === "importmap" ? undefined : "module",
			tags: [
				...(config.html.tags || []),
				(tags: any[], utils: { entryName: string }) => {
					const entryHtml = get_entry_html_config(utils.entryName);
					const entryTags = "tags" in entryHtml ? entryHtml.tags : undefined;
					if (Array.isArray(entryTags)) {
						return [...tags, ...entryTags] as any;
					}
					if (entryTags && typeof entryTags === "object") {
						return [...tags, entryTags] as any;
					}
				},
			] as any,
			template({ entryName }) {
				const entryHtml = get_entry_html_config(entryName);
				const entry_dir = entries[entryName].entry_dir;

				let template = entryHtml.template
				// 检查是否是相对路径
				if(typeof template === "string" &&template.startsWith('.')){
					// 将其转换为相对配置文件的路径
					template = resolve(entry_dir, template);
				}
				return entryHtml.template as string || config.html.template || resolve(get_package_root(), "template/index.html");
			},
			templateParameters(defaultValue, { entryName }) {
				const entryHtml = get_entry_html_config(entryName);
				const entryParams = entryHtml.templateParameters || undefined;
				return {
					...defaultValue,
					base_prefix: config.url.base,
					...entryParams,
				};
			},
		},
		resolve: {
			alias: config.alias,
		},
		server: {
			publicDir: workspaceRoot
				? {
						name: workspaceRoot,
						copyOnBuild: false,
						watch: false,
					}
				: undefined,
			open: config.dev_server.open
				? config.dev_server.open.map(
						(name: string) =>
							config.url.base +
							(name.endsWith("html") ? `/${name}` : `/${name}.html`),
					)
				: false,
			port: config.dev_server.port,
			proxy: config.dev_server.proxy,
		},
		performance: {
			chunkSplit: {
				strategy: "split-by-experience",
			},
		},
	});

	console.log(
		"Dev Server Config:",
		JSON.stringify(rsbuildConfig.server, null, 2),
	);

	const rsbuild = await createRsbuild({ rsbuildConfig });

	if (args.cmd === "dev") {
		await rsbuild.startDevServer();
	} else if (args.cmd === "preview") {
		await rsbuild.preview();
	} else {
		await rsbuild.build({
			watch: args.pack.watch,
		});
	}

	if (args.cmd === "build") {
		console.log(picocolors.green("\n**** 构建【page】完成 ****"));
	}
}
