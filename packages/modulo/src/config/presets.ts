import type { OutputConfig } from "@rsbuild/core";
import type { ExternalLibs } from "./type.ts";

export const preset_alias: Record<string, string> = {
	"@": "{input.src}",
};

export const preset_dev_server_config = {
	open: false as false | string[], // dev时是否自动打开指定页面
	port: 8080, // 开发页面时, dev-server服务器端口
	proxy: {} as Record<
		string,
		string | { target: string; pathRewrite?: Record<string, string>; changeOrigin?: boolean; secure?: boolean }
	>, // dev时的代理配置
};
export type DEV_SERVER_CONFIG = typeof preset_dev_server_config;

export const preset_input_dirs = {
	src: "src", // 源码目录
	pages: "pages", // 页面目录
	modules: "modules", // 组件目录
};

export const preset_output_dirs = {
	dist: "dist", // 源码目录
	pages: "", // 页面目录输出目录，默认使用dist/..
	modules: "modules", // 组件输出目录，默认使用dist/modules/..
	filenameHash: true,
};

export interface Tag {
	append?: boolean;
	attrs?: Record<string, string>;
	children?: string;
	hash?: boolean | string;
	head?: boolean;
	publicPath?: string | boolean;
	tag: string;
}

export const default_html_config = {
	meta: {} as Record<string, string>,
	root: "", // html挂载点id, 只允许id
	tags: [] as Tag[],
	template: "", // html模板的路径
	title: "", // html标题
};

export type HTML_CONFIG = typeof default_html_config;

export const preset_ui_libs = {
	// 对ui库做严格的版本限制，以提高统一程度
	react19: "19.2.4",
	vue2: "2.7.16",
};

export const preset_minify_config: OutputConfig["minify"] = {
	js: true,
	jsOptions: {
		minimizerOptions: {
			compress: {
				dead_code: true,
				defaults: false,
				toplevel: true,
				unused: true,
			},
			format: {
				comments: "some",
				ecma: 2015,
				preserve_annotations: true,
				safari10: true,
				semicolons: false,
			},
			mangle: true,
			minify: true,
		},
	},
};

export const preset_url_config = {
	base: "/", // 前缀路径
	cdn: "", // 可以将除了html资源以外的资源都部署到cdn上，比如https://cdn.host.com/，或者https://cdn.host.com/cdn-path/
};

export const preset_config = {
	analyze: false, // 是否执行bundleAnalyze
	define: {} as Record<string, string | boolean | number>, // 配置全局变量，用于打包时替换代码中的全局变量
	dev_server: preset_dev_server_config,
	externals: {} as ExternalLibs,
	html: default_html_config,
	input: preset_input_dirs,
	minify: preset_minify_config as OutputConfig["minify"], // 是否压缩产物，同时进行mangle
	output: preset_output_dirs,
	ui_lib: preset_ui_libs,
	url: preset_url_config,
	alias: preset_alias,
	webhost: true as boolean | "auto",
	autoExternal: true, // 是否自动external
	externalsType: "importmap" as "importmap" | "script", // external的类型
};
