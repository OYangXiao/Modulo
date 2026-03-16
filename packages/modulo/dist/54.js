import node_readline from "node:readline";
import { existsSync, extname, mkdirSync, writeFileSync, picocolors, resolve as external_node_path_resolve } from "./131.js";
import { preset_alias, preset_config, update_json_file, get_packagejson } from "./938.js";
async function cli_confirm(message) {
    const rl = node_readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve)=>{
        rl.question(`${picocolors.yellow(message)} (Y/n) `, (answer)=>{
            rl.close();
            resolve("y" === answer.toLowerCase() || "" === answer);
        });
    });
}
const star_line = "**********************";
async function modify_scripts() {
    const packagejson = get_packagejson();
    const new_scripts = {
        ...packagejson.scripts || {},
        "build:page": "modulo build page",
        "build:module": "modulo build module",
        "build:all": "modulo build all",
        build: "modulo build all",
        "dev:page": "modulo dev page",
        "dev:module": "modulo dev module",
        "watch:page": "modulo build page --watch=true",
        "watch:module": "modulo build module --watch=true"
    };
    console.log(picocolors.magentaBright(`\n${star_line}\n修改package.json中的scripts\n新的内容修改后如下:\n${JSON.stringify(new_scripts, null, 2)}\n${star_line}`));
    const confirmed = await cli_confirm("\n确定修改吗？");
    if (!confirmed) return void console.log("取消修改");
    const success = update_json_file(external_node_path_resolve(process.cwd(), "package.json"), (data)=>{
        data.scripts = new_scripts;
        return data;
    });
    if (success) console.log(picocolors.green(`\npackage.json修改成功`));
    else console.log(picocolors.red(`\npackage.json修改失败`));
}
const vue2_example_externals = {
    vue: {
        importName: [
            "vue",
            "Vue"
        ],
        url: "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm"
    }
};
const react19_example_externals = {
    react: {
        importName: [
            "react",
            "React"
        ],
        url: "https://esm.sh/react@19.2.4"
    },
    "react-dom": "https://esm.sh/react-dom@19.2.4",
    "react/jsx-runtime": "https://esm.sh/react@19.2.4/jsx-runtime"
};
const common_example_externals = {
    jquery: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
    rxjs: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/+esm"
};
const presets = {
    vue2: {
        ...vue2_example_externals,
        ...common_example_externals
    },
    react19: {
        ...react19_example_externals,
        ...common_example_externals
    }
};
function get_example_config(preset) {
    console.log(picocolors.magenta(`\n${star_line}\n默认配置文件中的externals内容为推荐内容\n请注意手动替换配置文件中externals的url，以保证符合项目需求\n如果不需要externals部分依赖，也可以将他们从列表中删除\n${star_line}\n`));
    let externals = common_example_externals;
    if (preset) {
        if ("react19" === preset) externals = presets.react19;
        else if ("vue2" === preset || "vue2" === preset) externals = presets.vue2;
    }
    return {
        input: preset_config.input,
        output: {
            filenameHash: true
        },
        url: {
            base: "/"
        },
        alias: preset_alias,
        html: {
            root: "app",
            title: "Modulo Page",
            meta: {},
            tags: [
                {
                    tag: "script",
                    attrs: {
                        src: "/packages/webhost/dist/webhost.system.js"
                    },
                    append: false,
                    publicPath: false
                }
            ]
        },
        dev_server: {
            proxy: preset_config.dev_server.proxy
        },
        externals
    };
}
const default_config_file_name = "modulo.config.ts";
async function create_config_file(args) {
    const path = args.init.path || default_config_file_name;
    console.log(picocolors.blue("即将创建配置文件"), path);
    const filepath = external_node_path_resolve(process.cwd(), path);
    if (existsSync(filepath)) if (args.init.force) console.log(picocolors.bgRed(picocolors.white("配置文件已存在，将覆盖")));
    else {
        console.log(picocolors.red("配置文件已存在，是否覆盖？"));
        const rl = node_readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const answer = await new Promise((resolve)=>{
            rl.question("\n请输入(Y/N) ", (answer)=>{
                rl.close();
                resolve(answer);
            });
        });
        if ("y" !== answer.toLowerCase()) return void console.log("取消创建");
    }
    const config = get_example_config(args.init.preset);
    const ext = extname(path);
    let content = "";
    content = ".ts" === ext ? `import type { UserConfig } from "@yannick-z/modulo";

const config: UserConfig = ${JSON.stringify(config, null, 2)};

export default config;
` : ".js" === ext ? `/** @type {import('@yannick-z/modulo').UserConfig} */
export default ${JSON.stringify(config, null, 2)};
` : JSON.stringify(config, null, 2);
    writeFileSync(filepath, content);
    console.log(picocolors.green("创建成功"), filepath);
}
async function create_project(args) {
    const { path, preset } = args.init;
    if (!path) {
        console.error(picocolors.red("请指定项目路径: modulo init project --path <project-path>"));
        process.exit(1);
    }
    const projectRoot = external_node_path_resolve(process.cwd(), path);
    if (existsSync(projectRoot)) {
        if (!args.init.force) {
            console.error(picocolors.red(`目录 ${path} 已存在，请使用 --force 覆盖或选择其他路径`));
            process.exit(1);
        }
    } else mkdirSync(projectRoot, {
        recursive: true
    });
    console.log(picocolors.blue(`正在初始化项目到: ${projectRoot}`));
    const originalCwd = process.cwd();
    process.chdir(projectRoot);
    try {
        const packageJson = {
            name: path.split("/").pop() || "modulo-project",
            version: "0.0.0",
            type: "module",
            scripts: {
                lint: "biome lint .",
                format: "biome format --write .",
                check: "biome check --write ."
            },
            dependencies: {},
            devDependencies: {
                "@yannick-z/modulo": "^0.2.0",
                typescript: "^5.0.0",
                "@biomejs/biome": "2.4.4"
            }
        };
        if ("vue2" === preset) packageJson.dependencies = {
            vue: "2.7.16"
        };
        else if ("react19" === preset) packageJson.dependencies = {
            react: "19.2.4",
            "react-dom": "19.2.4"
        };
        writeFileSync(external_node_path_resolve(projectRoot, "package.json"), JSON.stringify(packageJson, null, 2));
        console.log(picocolors.green("创建 package.json 成功"));
        get_packagejson(projectRoot);
        const tsConfig = {
            compilerOptions: {
                target: "ESNext",
                module: "ESNext",
                moduleResolution: "bundler",
                strict: true,
                jsx: "react19" === preset ? "react-jsx" : "preserve",
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                baseUrl: ".",
                paths: {
                    "@/*": [
                        "src/*"
                    ]
                }
            },
            include: [
                "src/**/*",
                "modulo.config.ts"
            ]
        };
        writeFileSync(external_node_path_resolve(projectRoot, "tsconfig.json"), JSON.stringify(tsConfig, null, 2));
        console.log(picocolors.green("创建 tsconfig.json 成功"));
        mkdirSync(external_node_path_resolve(projectRoot, "src/pages/index"), {
            recursive: true
        });
        if ("vue2" === preset) {
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
            writeFileSync(external_node_path_resolve(projectRoot, "src/pages/index/App.vue"), vueContent);
            const indexContent = `import Vue from 'vue';
import App from './App.vue';

new Vue({
  render: h => h(App)
}).$mount('#app');
`;
            writeFileSync(external_node_path_resolve(projectRoot, "src/pages/index/index.ts"), indexContent);
            const shimContent = `declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
`;
            writeFileSync(external_node_path_resolve(projectRoot, "src/shim-vue.d.ts"), shimContent);
        } else if ("react19" === preset) {
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
            writeFileSync(external_node_path_resolve(projectRoot, "src/pages/index/App.tsx"), appContent);
            const indexContent = `import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
`;
            writeFileSync(external_node_path_resolve(projectRoot, "src/pages/index/index.tsx"), indexContent);
        }
        const configArgs = {
            ...args,
            init: {
                ...args.init,
                path: ""
            }
        };
        await create_config_file(configArgs);
        modify_scripts();
        const biomeConfig = {
            $schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
            vcs: {
                enabled: false,
                clientKind: "git",
                useIgnoreFile: false
            },
            files: {
                ignoreUnknown: false,
                ignore: []
            },
            formatter: {
                enabled: true,
                indentStyle: "tab"
            },
            organizeImports: {
                enabled: true
            },
            linter: {
                enabled: true,
                rules: {
                    recommended: true
                }
            },
            javascript: {
                formatter: {
                    quoteStyle: "double"
                }
            }
        };
        writeFileSync(external_node_path_resolve(projectRoot, "biome.json"), JSON.stringify(biomeConfig, null, 2));
        console.log(picocolors.green("创建 biome.json 成功"));
        const vscodeExtensions = {
            recommendations: [
                "biomejs.biome"
            ]
        };
        mkdirSync(external_node_path_resolve(projectRoot, ".vscode"), {
            recursive: true
        });
        writeFileSync(external_node_path_resolve(projectRoot, ".vscode/extensions.json"), JSON.stringify(vscodeExtensions, null, 2));
        console.log(picocolors.green("创建 .vscode/extensions.json 成功"));
        console.log(picocolors.green("\n项目初始化完成！\n"));
        console.log(picocolors.cyan(`  cd ${path}`));
        console.log(picocolors.cyan("  npm install"));
        console.log(picocolors.cyan("  npm run dev page\n"));
    } catch (error) {
        console.error(picocolors.red("项目初始化失败:"), error);
    } finally{
        process.chdir(originalCwd);
    }
}
function init_tool(args) {
    if ("config" === args.target) create_config_file(args);
    if ("script" === args.target) modify_scripts();
    if ("project" === args.target) create_project(args);
}
export { init_tool };
