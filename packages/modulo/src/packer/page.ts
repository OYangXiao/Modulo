import { resolve } from "node:path";
import { createRsbuild, defineConfig } from "@rsbuild/core";
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

	const { entries, externals } = prepare_config(args, "page", config);

	if (!entries) {
		return;
	}

	const workspaceRoot = find_workspace_root(process.cwd());

	const rsbuildConfig = defineConfig({
		source: {
			define: config.define,
			entry: entries,
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
				root: config.output.dist,
			},
			externals,
			filenameHash: config.output.filenameHash,
			legalComments: "none",
			minify: config.minify,
		},
		html: {
			meta: config.html.meta,
			mountId: config.html.root,
			scriptLoading: config.externalsType === "importmap" ? undefined : "module",
			tags: config.html.tags,
			template:
				config.html.template ||
				resolve(get_package_root(), "template/index.html"),
			templateParameters: {
				base_prefix: config.url.base,
			},
			title: config.html.title,
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
