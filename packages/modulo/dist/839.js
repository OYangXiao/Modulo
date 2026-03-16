import { pluginLess } from "@rsbuild/plugin-less";
import { createRslib, defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import semver from "semver";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
import { createRequire } from "node:module";
import { get_directories, exists, fileURLToPath, get_packagejson, get_global_config, PANIC_IF, find_entry_file } from "./938.js";
import { debug_log, node_path, relative, node_fs, dirname, resolve, picocolors } from "./131.js";
function get_framework_name() {
    const { dependencies } = get_packagejson();
    PANIC_IF(!("vue" in dependencies || "react" in dependencies), "package.json中未识别到支持的ui库信息, 当前只支持vue和react");
    return "vue" in dependencies ? "vue" : "react";
}
function framework_plugin(global_config, options) {
    const { dependencies } = get_packagejson();
    const framework_name = get_framework_name();
    const version = dependencies[framework_name];
    const allowed_versions = [
        global_config.ui_lib.vue2,
        global_config.ui_lib.react19
    ];
    const is_valid = allowed_versions.some((allowed)=>{
        const min_version = semver.minVersion(version);
        return min_version && semver.satisfies(min_version, `^${allowed}`);
    });
    PANIC_IF(!is_valid, `package.json中只允许使用固定版本号, 并且只支持vue-2.7.16, react-19.2.4 (当前版本: ${version})`);
    return "vue" === framework_name ? pluginVue2(options) : pluginReact(options);
}
function collect_modules(args, kind, global_config) {
    const framework_name = get_framework_name();
    const module_path = global_config.input[`${kind}s`];
    const isExist = exists(module_path);
    debug_log(picocolors.blue("check module_path"), module_path, isExist ? "exists" : "NOT exists");
    if (!isExist) return;
    const baseCandidates = [
        "index",
        "main"
    ];
    const extensions = [
        ".ts",
        ".tsx",
        ".js",
        ".jsx"
    ];
    if ("vue" === framework_name) extensions.unshift(".vue");
    const module_entries = get_directories(module_path).map((dirName)=>{
        const dir_path = resolve(module_path, dirName);
        const candidates = [
            ...baseCandidates,
            dirName
        ];
        const entry_file_path = find_entry_file(dir_path, candidates, extensions);
        debug_log("found entry", dirName, entry_file_path || "NOT FOUND");
        return [
            dirName,
            entry_file_path
        ];
    }).filter((entry)=>!!entry[1]);
    return module_entries.length > 0 ? Object.fromEntries(module_entries) : void 0;
}
function omit_root_path(path) {
    const rel = relative(process.cwd(), path);
    return rel.startsWith("/") ? rel : `/${rel}`;
}
function omit_root_path_for_entries(entries) {
    return Object.fromEntries(Object.entries(entries).map(([key, value])=>[
            key,
            omit_root_path(value)
        ]));
}
function is_string(data) {
    return "string" == typeof data;
}
function is_record(data) {
    return !!data && "object" == typeof data;
}
function is_env_external(data) {
    return is_record(data) && is_string(data.dev) && is_string(data.prd);
}
function getExternalUrl(args, url) {
    let resolvedUrl = url;
    while(!is_string(resolvedUrl))if (!is_env_external(resolvedUrl)) return;
    else resolvedUrl = resolvedUrl[args.pack.env];
    return resolvedUrl;
}
function getExternalsAndImportMap(args, externalLibs, externalsType = "importmap") {
    return Object.entries(externalLibs).reduce(({ externals, importMap }, [libName, data])=>{
        let externalLib;
        externalLib = is_string(data) ? {
            url: data
        } : is_env_external(data) ? {
            url: data
        } : data;
        const url = getExternalUrl(args, externalLib.url);
        if ("script" === externalsType) {
            const globalVar = externalLib.global || libName;
            const importName = externalLib.importName || libName;
            (Array.isArray(importName) ? importName : [
                importName
            ]).forEach((name)=>{
                externals[name] = globalVar;
            });
            if (url) importMap[libName] = url;
        } else {
            const importName = externalLib.importName || libName;
            (Array.isArray(importName) ? importName : [
                importName
            ]).forEach((name)=>{
                externals[name] = libName;
            });
            if (url) importMap[libName] = url;
        }
        return {
            externals,
            importMap
        };
    }, {
        externals: {},
        importMap: {}
    });
}
let printed = false;
function prepare_config(args, kind, config) {
    console.log(picocolors.blueBright(`\n**** 开始构建 【${kind}】 ****`));
    const entries = collect_modules(args, kind, config);
    if (entries) console.log(`${picocolors.blue(`\n${kind} entries:`)}\n${JSON.stringify(omit_root_path_for_entries(entries), null, 2)}\n`);
    else console.log(picocolors.red(`\n没有要构建的${kind}，跳过\n`));
    const { externals, importMap } = getExternalsAndImportMap(args, config.externals, config.externalsType);
    printed || console.log(`${picocolors.blue("\nexternals:")}\n${JSON.stringify(externals, null, 2)}\n`);
    let importMapsTag;
    importMapsTag = "script" === config.externalsType ? Object.values(importMap).map((url)=>({
            tag: "script",
            attrs: {
                src: url
            },
            append: false,
            head: true
        })) : [
        {
            append: false,
            head: true,
            tag: "script",
            attrs: {
                type: "importmap"
            },
            children: `{
            "imports": ${JSON.stringify(importMap, null, 2)}
        }`
        }
    ];
    printed || console.log(`${picocolors.blue("\nimportmaps/scripts:")}\n${JSON.stringify(importMap, null, 2)}\n`);
    printed = true;
    return {
        entries,
        externals,
        importMapsTag
    };
}
async function lib_pack(args) {
    const config = await get_global_config(args);
    const packagejson = get_packagejson();
    const { entries, externals } = prepare_config(args, "module", config);
    if (!entries) return;
    const rslibConfig = defineConfig({
        root: process.cwd(),
        source: {
            define: config.define,
            entry: entries
        },
        plugins: [
            framework_plugin(config),
            pluginLess()
        ],
        resolve: {
            alias: config.alias
        },
        lib: [
            {
                format: "esm",
                syntax: "esnext",
                dts: false,
                output: {
                    assetPrefix: `${config.url.base}/modules`,
                    externals,
                    distPath: {
                        root: config.output.modules,
                        js: "esm",
                        jsAsync: "esm",
                        css: "esm"
                    },
                    minify: config.minify
                }
            },
            {
                format: "umd",
                output: {
                    assetPrefix: `${config.url.base}/modules`,
                    externals,
                    distPath: {
                        root: config.output.modules,
                        js: "umd",
                        jsAsync: "umd",
                        css: "umd"
                    },
                    minify: config.minify
                },
                syntax: "es6",
                umdName: `${packagejson.name}-modules-[name]`
            }
        ],
        output: {
            legalComments: "none",
            target: "web"
        },
        performance: {
            bundleAnalyze: config.analyze ? {
                analyzerMode: "disabled",
                generateStatsFile: true
            } : void 0,
            chunkSplit: {
                strategy: "all-in-one"
            }
        }
    });
    const rslibInstance = await createRslib({
        config: rslibConfig
    });
    await rslibInstance.build({
        watch: "build" === args.cmd && !!args.pack.watch
    });
    if ("build" === args.cmd) console.log(picocolors.green("\n**** 构建【module】完成 ****\n"));
}
let packageRoot = "";
function get_package_root() {
    if (!packageRoot) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        let currentDir = node_path.resolve(__dirname);
        const root = node_path.parse(currentDir).root;
        while(currentDir !== root){
            const potentialPkgJson = node_path.join(currentDir, "package.json");
            if (node_fs.existsSync(potentialPkgJson)) break;
            currentDir = node_path.dirname(currentDir);
        }
        debug_log("packageRoot", currentDir);
        packageRoot = currentDir;
    }
    return packageRoot;
}
function find_workspace_root(cwd) {
    let currentDir = node_path.resolve(cwd);
    const root = node_path.parse(currentDir).root;
    while(currentDir !== root){
        const pnpmWorkspace = node_path.join(currentDir, "pnpm-workspace.yaml");
        const packageJsonPath = node_path.join(currentDir, "package.json");
        if (node_fs.existsSync(pnpmWorkspace)) return currentDir;
        if (node_fs.existsSync(packageJsonPath)) try {
            const pkg = JSON.parse(node_fs.readFileSync(packageJsonPath, "utf-8"));
            if (pkg.workspaces) return currentDir;
        } catch  {}
        currentDir = node_path.dirname(currentDir);
    }
}
const auto_external_plugin_require = createRequire(import.meta.url);
class AutoExternalPlugin {
    externalLibNames;
    usedExternals;
    args;
    config;
    constructor(args, config){
        this.args = args;
        this.config = config;
        this.externalLibNames = Object.keys(config.externals);
        this.usedExternals = new Set();
    }
    apply(compiler) {
        compiler.hooks.compilation.tap("AutoExternalPlugin", (compilation)=>{
            compilation.hooks.finishModules.tap("AutoExternalPlugin", (modules)=>{
                for (const module of modules){
                    const constructorName = module.constructor.name;
                    const request = module.request;
                    const userRequest = module.userRequest;
                    const resource = module.resource;
                    const externalType = module.externalType;
                    if ('ExternalModule' === constructorName || externalType) {
                        const libName = request || userRequest;
                        if (libName && this.externalLibNames.includes(libName)) {
                            this.usedExternals.add(libName);
                            continue;
                        }
                    }
                    if (resource && resource.includes("node_modules")) {
                        for (const libName of this.externalLibNames)if (resource.includes(`/node_modules/${libName}/`) || resource.includes(`\\node_modules\\${libName}\\`)) this.usedExternals.add(libName);
                    } else if (resource && resource.includes("/node_modules/.pnpm/")) {
                        for (const libName of this.externalLibNames)if (resource.includes(`/node_modules/.pnpm/${libName}@`) || resource.includes(`/node_modules/.pnpm/${libName}+`) || resource.includes(`/node_modules/${libName}/`)) this.usedExternals.add(libName);
                    }
                }
            });
            compiler.hooks.emit.tapAsync("AutoExternalPlugin", (compilation, cb)=>{
                if (process.env.DEBUG) console.log('[AutoExternalPlugin] emit hook triggered');
                const assetNames = Object.keys(compilation.assets);
                if (process.env.DEBUG) console.log('[AutoExternalPlugin] Assets:', assetNames);
                cb();
            });
            let HtmlWebpackPlugin;
            const htmlPluginInstance = compiler.options.plugins.find((p)=>p && ("HtmlWebpackPlugin" === p.constructor.name || "HtmlRspackPlugin" === p.constructor.name));
            if (htmlPluginInstance) HtmlWebpackPlugin = htmlPluginInstance.constructor;
            if (!HtmlWebpackPlugin) HtmlWebpackPlugin = compiler.webpack.HtmlRspackPlugin || compiler.webpack.HtmlWebpackPlugin;
            if (!HtmlWebpackPlugin) try {
                HtmlWebpackPlugin = auto_external_plugin_require('@rspack/plugin-html').HtmlRspackPlugin;
            } catch (e) {}
            if (!HtmlWebpackPlugin) return;
            if ('function' != typeof HtmlWebpackPlugin.getHooks) return;
            const hooks = HtmlWebpackPlugin.getHooks(compilation);
            hooks.alterAssetTags.tapAsync("AutoExternalPlugin", (data, cb)=>{
                if (data.assetTags && data.assetTags.scripts) this.processTags(data, "assetTags.scripts");
                cb(null, data);
            });
        });
    }
    processTags(data, targetProp) {
        if (!this.config.autoExternal) return data;
        const { importMap } = getExternalsAndImportMap(this.args, this.config.externals, this.config.externalsType);
        const filteredImportMap = Object.fromEntries(Object.entries(importMap).filter(([key])=>this.usedExternals.has(key)));
        if (0 === Object.keys(filteredImportMap).length) return data;
        let tags = [];
        tags = "script" === this.config.externalsType ? Object.values(filteredImportMap).map((url)=>({
                tagName: "script",
                voidTag: false,
                attributes: {
                    src: url
                }
            })) : [
            {
                tagName: "script",
                voidTag: false,
                attributes: {
                    type: "importmap"
                },
                innerHTML: JSON.stringify({
                    imports: filteredImportMap
                }, null, 2)
            }
        ];
        if ('headTags' === targetProp) data.headTags.unshift(...tags);
        else if ("assetTags.scripts" === targetProp) data.assetTags.scripts.unshift(...tags);
        else if ('head' === targetProp) data.head.unshift(...tags);
        return data;
    }
}
async function page_pack(args) {
    const config = await get_global_config(args);
    const { entries, externals } = prepare_config(args, "page", config);
    if (!entries) return;
    const workspaceRoot = find_workspace_root(process.cwd());
    const rsbuildConfig = core_defineConfig({
        source: {
            define: config.define,
            entry: entries
        },
        plugins: [
            framework_plugin(config),
            pluginLess()
        ],
        tools: {
            rspack: {
                experiments: {
                    outputModule: "importmap" === config.externalsType ? true : void 0
                },
                plugins: [
                    new AutoExternalPlugin(args, config)
                ]
            }
        },
        output: {
            assetPrefix: config.url.cdn || config.url.base,
            distPath: {
                root: config.output.distPath
            },
            externals,
            filenameHash: config.output.filenameHash,
            legalComments: "none",
            minify: config.minify
        },
        html: {
            meta: config.html.meta,
            mountId: config.html.root,
            scriptLoading: "importmap" === config.externalsType ? void 0 : "module",
            tags: config.html.tags,
            template: config.html.template || resolve(get_package_root(), "template/index.html"),
            templateParameters: {
                base_prefix: config.url.base
            },
            title: config.html.title
        },
        resolve: {
            alias: config.alias
        },
        server: {
            publicDir: workspaceRoot ? {
                name: workspaceRoot,
                copyOnBuild: false,
                watch: false
            } : void 0,
            open: config.dev_server.open ? config.dev_server.open.map((name)=>config.url.base + (name.endsWith("html") ? `/${name}` : `/${name}.html`)) : false,
            port: config.dev_server.port,
            proxy: config.dev_server.proxy
        },
        performance: {
            chunkSplit: {
                strategy: "split-by-experience"
            }
        }
    });
    console.log("Dev Server Config:", JSON.stringify(rsbuildConfig.server, null, 2));
    const rsbuild = await createRsbuild({
        rsbuildConfig
    });
    if ("dev" === args.cmd) await rsbuild.startDevServer();
    else if ("preview" === args.cmd) await rsbuild.preview();
    else await rsbuild.build({
        watch: args.pack.watch
    });
    if ("build" === args.cmd) console.log(picocolors.green("\n**** 构建【page】完成 ****"));
}
async function pack_code(args) {
    const { target } = args;
    if ("preview" === args.cmd) return void await page_pack(args);
    if ("all" === target && "dev" === args.cmd) return void await Promise.all([
        page_pack(args),
        lib_pack(args)
    ]);
    if ("page" === target || "all" === target) await page_pack(args);
    if ("module" === target || "all" === target) await lib_pack(args);
}
export { pack_code };
