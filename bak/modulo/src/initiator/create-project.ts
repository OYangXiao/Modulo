import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import picocolors from "picocolors";
import type { ModuloArgs_Init } from "../args/index.ts";
import { create_config_file } from "./create-config-file.ts";
import { modify_scripts } from "./modify-scripts.ts";
import { get_packagejson } from "../config/index.ts";

export async function create_project(args: ModuloArgs_Init) {
	const { path, preset } = args.init;

	if (!path) {
		console.error(
			picocolors.red(
				"请指定项目路径: modulo init project --path <project-path>",
			),
		);
		process.exit(1);
	}

	const projectRoot = resolve(process.cwd(), path);

	if (existsSync(projectRoot)) {
		if (!args.init.force) {
			console.error(
				picocolors.red(
					`目录 ${path} 已存在，请使用 --force 覆盖或选择其他路径`,
				),
			);
			process.exit(1);
		}
	} else {
		mkdirSync(projectRoot, { recursive: true });
	}

	console.log(picocolors.blue(`正在初始化项目到: ${projectRoot}`));

	// 切换工作目录到新项目目录，以便复用现有的 config 和 script 生成逻辑
	const originalCwd = process.cwd();
	process.chdir(projectRoot);

	try {
		// 1. 创建 package.json
		const packageJson = {
			name: path.split("/").pop() || "modulo-project",
			version: "0.0.0",
			type: "module",
			scripts: {
				lint: "biome lint .",
				format: "biome format --write .",
				check: "biome check --write .",
			},
			dependencies: {},
			devDependencies: {
				"@yannick-z/modulo": "^0.2.0",
				typescript: "^5.0.0",
				"@biomejs/biome": "2.4.4",
			},
		};

		// 添加依赖
		if (preset === "vue2") {
			packageJson.dependencies = {
				vue: "2.7.16",
			};
		} else if (preset === "react19") {
			packageJson.dependencies = {
				react: "19.2.4",
				"react-dom": "19.2.4",
			};
		}

		writeFileSync(
			resolve(projectRoot, "package.json"),
			JSON.stringify(packageJson, null, 2),
		);
		console.log(picocolors.green("创建 package.json 成功"));

		// 手动触发一次 get_packagejson 以缓存新创建的 package.json
		get_packagejson(projectRoot);

		// 2. 创建 tsconfig.json
		const tsConfig = {
			compilerOptions: {
				target: "ESNext",
				module: "ESNext",
				moduleResolution: "bundler",
				strict: true,
				jsx: preset === "react19" ? "react-jsx" : "preserve",
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
				baseUrl: ".",
				paths: {
					"@/*": ["src/*"],
				},
			},
			include: ["src/**/*", "modulo.config.ts"],
		};
		writeFileSync(
			resolve(projectRoot, "tsconfig.json"),
			JSON.stringify(tsConfig, null, 2),
		);
		console.log(picocolors.green("创建 tsconfig.json 成功"));

		// 3. 创建目录结构
		mkdirSync(resolve(projectRoot, "src/pages/index"), { recursive: true });

		// 4. 创建示例代码
		if (preset === "vue2") {
			const vueContent = `<template>
  <div id="app">
    <h1>Hello Modulo + Vue 2</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'App'
});
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
`;
			writeFileSync(
				resolve(projectRoot, "src/pages/index/App.vue"),
				vueContent,
			);

			const indexContent = `import Vue from 'vue';
import App from './App.vue';

new Vue({
  render: h => h(App)
}).$mount('#app');
`;
			writeFileSync(
				resolve(projectRoot, "src/pages/index/index.ts"),
				indexContent,
			);

			// 创建 shim-vue.d.ts
			const shimContent = `declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
`;
			writeFileSync(resolve(projectRoot, "src/shim-vue.d.ts"), shimContent);
		} else if (preset === "react19") {
			const appContent = `import { useState } from 'react';

export function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Hello Modulo + React 19</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}
`;
			writeFileSync(
				resolve(projectRoot, "src/pages/index/App.tsx"),
				appContent,
			);

			const indexContent = `import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
`;
			writeFileSync(
				resolve(projectRoot, "src/pages/index/index.tsx"),
				indexContent,
			);
		}

		// 5. 生成配置文件
		// 将 path 重置为 undefined，否则 create_config_file 会使用项目路径作为配置文件名
		const configArgs = { ...args, init: { ...args.init, path: "" } };
		await create_config_file(configArgs);

		// 6. 添加 scripts
		modify_scripts();

		// 7. 生成 biome.json
		const biomeConfig = {
			$schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
			vcs: {
				enabled: false,
				clientKind: "git",
				useIgnoreFile: false,
			},
			files: {
				ignoreUnknown: false,
				ignore: [],
			},
			formatter: {
				enabled: true,
				indentStyle: "tab",
			},
			organizeImports: {
				enabled: true,
			},
			linter: {
				enabled: true,
				rules: {
					recommended: true,
				},
			},
			javascript: {
				formatter: {
					quoteStyle: "double",
				},
			},
		};
		writeFileSync(
			resolve(projectRoot, "biome.json"),
			JSON.stringify(biomeConfig, null, 2),
		);
		console.log(picocolors.green("创建 biome.json 成功"));

		// 8. 创建 .vscode/extensions.json
		const vscodeExtensions = {
			recommendations: ["biomejs.biome"],
		};
		mkdirSync(resolve(projectRoot, ".vscode"), { recursive: true });
		writeFileSync(
			resolve(projectRoot, ".vscode/extensions.json"),
			JSON.stringify(vscodeExtensions, null, 2),
		);
		console.log(picocolors.green("创建 .vscode/extensions.json 成功"));

		console.log(picocolors.green("\n项目初始化完成！\n"));
		console.log(picocolors.cyan(`  cd ${path}`));
		console.log(picocolors.cyan("  npm install"));
		console.log(picocolors.cyan("  npm run dev page\n"));
	} catch (error) {
		console.error(picocolors.red("项目初始化失败:"), error);
	} finally {
		process.chdir(originalCwd);
	}
}
