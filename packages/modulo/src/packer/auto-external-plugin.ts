import { createRequire } from 'node:module';
import type { Compiler, Compilation } from "@rspack/core";
const require = createRequire(import.meta.url);
import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
import { getExternalsAndImportMap } from "./get-externals-and-tags.ts";

/**
 * 自动 External 插件
 *
 * 1. 扫描编译过程中使用到的 node_modules 依赖
 * 2. 如果这些依赖在 config.externals 中定义了，则标记为已使用
 * 3. 在 HTML 生成阶段，仅注入已使用的依赖的 importmap 或 script 标签
 */
export class AutoExternalPlugin {
	private externalLibNames: string[];
	private usedExternals: Set<string>;
	private args: ModuloArgs_Pack;
	private config: GLOBAL_CONFIG;

	constructor(args: ModuloArgs_Pack, config: GLOBAL_CONFIG) {
		this.args = args;
		this.config = config;
		this.externalLibNames = Object.keys(config.externals);
		this.usedExternals = new Set<string>();
	}

	apply(compiler: Compiler) {
		compiler.hooks.compilation.tap(
			"AutoExternalPlugin",
			(compilation: Compilation) => {
				// 1. 扫描模块依赖
				compilation.hooks.finishModules.tap("AutoExternalPlugin", (modules) => {
					// ... (省略模块扫描逻辑，这里没有问题) ...
					for (const module of modules) {
						// @ts-ignore
						const constructorName = module.constructor.name;
						// @ts-ignore
						const request = module.request;
						// @ts-ignore
						const userRequest = module.userRequest;
						// @ts-ignore
						const resource = module.resource;
						// @ts-ignore
						const externalType = module.externalType;

						// 策略 A: 检查 ExternalModule
						// Rspack 中 ExternalModule 的 userRequest 通常是 import 的路径 (例如 'vue')
						if (constructorName === 'ExternalModule' || externalType) {
							const libName = request || userRequest; // 通常 request 是 'vue'
							if (libName && this.externalLibNames.includes(libName)) {
								this.usedExternals.add(libName);
								continue;
							}
						}

						// 策略 B: 检查 module.resource 是否包含 node_modules (针对未被 external 但我们想知道是否被引用的情况 - 但这通常意味着它被打包了)
						// 之前的逻辑保留，作为兜底，或者针对未正确 external 的情况
						if (resource && resource.includes("node_modules")) {
							for (const libName of this.externalLibNames) {
								if (
									resource.includes(`/node_modules/${libName}/`) ||
									resource.includes(`\\node_modules\\${libName}\\`)
								) {
									this.usedExternals.add(libName);
								}
							}
						} else if (resource && resource.includes("/node_modules/.pnpm/")) {
							// 兼容 pnpm
							for (const libName of this.externalLibNames) {
								if (
									resource.includes(`/node_modules/.pnpm/${libName}@`) ||
									resource.includes(`/node_modules/.pnpm/${libName}+`) ||
									// 某些情况下 pnpm 可能会直接链接
									resource.includes(`/node_modules/${libName}/`)
								) {
									this.usedExternals.add(libName);
								}
							}
						}
					}
				});

				// 尝试通过 compilation.hooks 访问 HtmlWebpackPlugin hooks
				// Rsbuild 可能通过 mixin 或者其他方式将 hooks 注入到了 compilation 上
				// 或者我们可以尝试直接使用 tapAsync 到 HtmlWebpackPlugin 的实例上，如果我们能找到它

				// 终极 Hook 调试: 使用 compiler.hooks.emit 来检查 assets，看是否包含 index.html，以及内容
				compiler.hooks.emit.tapAsync("AutoExternalPlugin", (compilation, cb) => {
					if (process.env.DEBUG) console.log('[AutoExternalPlugin] emit hook triggered');
					// 检查 compilation.assets
					const assetNames = Object.keys(compilation.assets);
					if (process.env.DEBUG) console.log('[AutoExternalPlugin] Assets:', assetNames);
					cb();
				});

				// 2. 注入 HTML
				let HtmlWebpackPlugin: any;

				// 优先从 compiler.options.plugins 中查找实例并获取其构造函数
				// 这是最稳妥的方式，确保我们获取的是同一个类的构造函数
				const htmlPluginInstance = compiler.options.plugins.find(
					(p: any) => p && (p.constructor.name === "HtmlWebpackPlugin" || p.constructor.name === "HtmlRspackPlugin")
				);

				if (htmlPluginInstance) {
					HtmlWebpackPlugin = htmlPluginInstance.constructor;
				}

				// Fallback: 如果没找到实例（可能被封装了），尝试从 compiler.webpack 中获取
				if (!HtmlWebpackPlugin) {
					HtmlWebpackPlugin =
						compiler.webpack.HtmlRspackPlugin ||
						(compiler.webpack as any).HtmlWebpackPlugin;
				}

				if (!HtmlWebpackPlugin) {
					// Try to import from @rspack/plugin-html
					try {
						HtmlWebpackPlugin = require('@rspack/plugin-html').HtmlRspackPlugin;
					} catch (e) {
						// ignore
					}
				}

				if (!HtmlWebpackPlugin) {
					return;
				}

				// 确保我们拿到的确实是 HtmlWebpackPlugin 构造函数，并且它有 getHooks 方法
				if (typeof (HtmlWebpackPlugin as any).getHooks !== 'function') {
					return;
				}

				const hooks = (HtmlWebpackPlugin as any).getHooks(compilation);

				hooks.alterAssetTags.tapAsync("AutoExternalPlugin", (data: any, cb: any) => {
					if (data.assetTags && data.assetTags.scripts) {
						this.processTags(data, 'assetTags.scripts');
					}
					cb(null, data);
				});
			},
		);
	}

	private processTags(data: any, targetProp: string) {
		if (!this.config.autoExternal) {
			return data;
		}

		// 重新计算 importmaps
		const { importMap } = getExternalsAndImportMap(
			this.args,
			this.config.externals,
			this.config.externalsType,
		);

		// 过滤未使用的依赖
		const filteredImportMap = Object.fromEntries(
			Object.entries(importMap).filter(([key]) =>
				this.usedExternals.has(key),
			),
		);

		if (Object.keys(filteredImportMap).length === 0) {
			return data;
		}

		let tags: any[] = [];
		if (this.config.externalsType === "script") {
			tags = Object.values(filteredImportMap).map((url) => ({
				tagName: "script",
				voidTag: false,
				attributes: {
					src: url,
				},
			}));
		} else {
			tags = [
				{
					tagName: "script",
					voidTag: false,
					attributes: { type: "importmap" },
					innerHTML: JSON.stringify(
						{ imports: filteredImportMap },
						null,
						2,
					),
				},
			];
		}

		// 插入到 head 的最前面
		if (targetProp === 'headTags') {
			data.headTags.unshift(...tags);
		} else if (targetProp === 'assetTags.scripts') {
			data.assetTags.scripts.unshift(...tags);
		} else if (targetProp === 'head') {
			data.head.unshift(...tags);
		}

		return data;
	}
}
