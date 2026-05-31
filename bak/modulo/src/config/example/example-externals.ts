import type { ExternalLibs } from "../type.ts";

// 构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
export const vue2_example_externals: ExternalLibs = {
	vue: {
		// 支持多个importName，以避免import Vue from 'Vue'这种不正规的写法
		importName: ["vue", "Vue"],
		// preset代表初始化配置的时候能够减少无用配置，比如vue的preset会自动过滤只配置vue的externals
		// url可以直接写字符串，则无论哪种打包模式，都使用这个url
		// 也可以分别提供umd和esm的url，则会根据打包模式自动切换
		// 另外还支持dev和prd模式分别提供不同的url
		url: "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm",
	},
};
export const react19_example_externals: ExternalLibs = {
	react: {
		importName: ["react", "React"],
		url: "https://esm.sh/react@19.2.4",
	},
	"react-dom": "https://esm.sh/react-dom@19.2.4",
	"react/jsx-runtime": "https://esm.sh/react@19.2.4/jsx-runtime",
};
export const common_example_externals: ExternalLibs = {
	jquery: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
	rxjs: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/+esm",
};

export const presets = {
	vue2: { ...vue2_example_externals, ...common_example_externals },
	react19: { ...react19_example_externals, ...common_example_externals },
};
