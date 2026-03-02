import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import semver from "semver";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
import { fileURLToPath } from "node:url";
export const __webpack_id__ = "897";
export const __webpack_ids__ = [
    "897"
];
export const __webpack_modules__ = {
    "./src/cli/pack-code.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
            pack_code: ()=>pack_code
        });
        var external_picocolors_ = __webpack_require__("picocolors");
        var src_config = __webpack_require__("./src/config/index.ts");
        var panic = __webpack_require__("./src/tools/panic.ts");
        function get_framework_name() {
            const { dependencies } = (0, src_config.mJ)();
            (0, panic.a)(!("vue" in dependencies || "react" in dependencies), "package.json中未识别到支持的ui库信息, 当前只支持vue和react");
            return "vue" in dependencies ? "vue" : "react";
        }
        function framework_plugin(args, options) {
            const { dependencies } = (0, src_config.mJ)();
            const framework_name = get_framework_name();
            const version = dependencies[framework_name];
            const global_config = (0, src_config.eP)(args);
            const allowed_versions = [
                global_config.ui_lib.vue,
                global_config.ui_lib.react,
                global_config.ui_lib.react19
            ];
            const is_valid = allowed_versions.some((allowed)=>{
                const min_version = semver.minVersion(version);
                return min_version && semver.satisfies(min_version, `^${allowed}`);
            });
            (0, panic.a)(!is_valid, `package.json中只允许使用固定版本号, 并且只支持vue-2.7.16, react-17.0.2和react-19.0.0 (当前版本: ${version})`);
            return "vue" === framework_name ? pluginVue2(options) : pluginReact(options);
        }
        var external_node_path_ = __webpack_require__("node:path");
        var debug_log = __webpack_require__("./src/tools/debug-log.ts");
        var file = __webpack_require__("./src/tools/file.ts");
        function collect_modules(args, kind) {
            const global_config = (0, src_config.eP)(args);
            const framework_name = get_framework_name();
            const module_path = global_config.input[`${kind}s`];
            const isExist = (0, file.t2)(module_path);
            (0, debug_log.n)(external_picocolors_["default"].blue("check module_path"), module_path, isExist ? "exists" : "NOT exists");
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
            const module_entries = (0, file.xh)(module_path).map((dirName)=>{
                const dir_path = (0, external_node_path_.resolve)(module_path, dirName);
                const candidates = [
                    ...baseCandidates,
                    dirName
                ];
                const entry_file_path = (0, file.Ke)(dir_path, candidates, extensions);
                (0, debug_log.n)("found entry", dirName, entry_file_path || "NOT FOUND");
                return [
                    dirName,
                    entry_file_path
                ];
            }).filter((entry)=>!!entry[1]);
            return module_entries.length > 0 ? Object.fromEntries(module_entries) : void 0;
        }
        function omit_root_path(path) {
            const rel = (0, external_node_path_.relative)(process.cwd(), path);
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
                const externalData = is_env_external(data) ? data[args.pack.env] : data;
                let externalLib;
                externalLib = "string" == typeof externalData ? {
                    url: externalData
                } : externalData;
                const url = getExternalUrl(args, externalLib.url);
                if ("script" === externalsType) {
                    const globalVar = externalLib.global || libName;
                    const importName = externalLib.importName || libName;
                    (Array.isArray(importName) ? importName : [
                        importName
                    ]).forEach((name)=>externals[name] = globalVar);
                    if (url) importMap[libName] = url;
                } else {
                    const importName = externalLib.importName || libName;
                    (Array.isArray(importName) ? importName : [
                        importName
                    ]).forEach((name)=>externals[name] = libName);
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
            console.log(external_picocolors_["default"].blueBright(`\n**** 开始构建 【${kind}】 ****`));
            const entries = collect_modules(args, kind);
            if (entries) console.log(`${external_picocolors_["default"].blue(`\n${kind} entries:`)}\n${JSON.stringify(omit_root_path_for_entries(entries), null, 2)}\n`);
            else console.log(external_picocolors_["default"].red(`\n没有要构建的${kind}，跳过\n`));
            const { externals, importMap } = getExternalsAndImportMap(args, config.externals, config.externalsType);
            printed || console.log(`${external_picocolors_["default"].blue("\nexternals:")}\n${JSON.stringify(externals, null, 2)}\n`);
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
            printed || console.log(`${external_picocolors_["default"].blue("\nimportmaps/scripts:")}\n${JSON.stringify(importMap, null, 2)}\n`);
            printed = true;
            return {
                entries,
                externals,
                importMapsTag
            };
        }
        async function lib_pack(args) {
            const config = (0, src_config.eP)(args);
            const packagejson = (0, src_config.mJ)();
            const { entries, externals } = prepare_config(args, "module", config);
            if (!entries) return;
            const rslibConfig = defineConfig({
                source: {
                    define: config.define,
                    entry: entries
                },
                plugins: [
                    framework_plugin(args),
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
            await build(rslibConfig, {
                watch: "build" === args.cmd && args.pack.watch
            });
            if ("build" === args.cmd) console.log(external_picocolors_["default"].green("\n**** 构建【module】完成 ****\n"));
        }
        var external_node_fs_ = __webpack_require__("node:fs");
        let packageRoot = '';
        function get_package_root() {
            if (!packageRoot) {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = (0, external_node_path_.dirname)(__filename);
                let currentDir = external_node_path_["default"].resolve(__dirname);
                const root = external_node_path_["default"].parse(currentDir).root;
                while(currentDir !== root){
                    const potentialPkgJson = external_node_path_["default"].join(currentDir, 'package.json');
                    if (external_node_fs_["default"].existsSync(potentialPkgJson)) break;
                    currentDir = external_node_path_["default"].dirname(currentDir);
                }
                (0, debug_log.n)('packageRoot', currentDir);
                packageRoot = currentDir;
            }
            return packageRoot;
        }
        function find_workspace_root(cwd) {
            let currentDir = external_node_path_["default"].resolve(cwd);
            const root = external_node_path_["default"].parse(currentDir).root;
            while(currentDir !== root){
                const pnpmWorkspace = external_node_path_["default"].join(currentDir, "pnpm-workspace.yaml");
                const packageJsonPath = external_node_path_["default"].join(currentDir, "package.json");
                if (external_node_fs_["default"].existsSync(pnpmWorkspace)) return currentDir;
                if (external_node_fs_["default"].existsSync(packageJsonPath)) try {
                    const pkg = JSON.parse(external_node_fs_["default"].readFileSync(packageJsonPath, "utf-8"));
                    if (pkg.workspaces) return currentDir;
                } catch  {}
                currentDir = external_node_path_["default"].dirname(currentDir);
            }
        }
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
                            const resource = module.resource;
                            if (resource && resource.includes("node_modules")) {
                                for (const libName of this.externalLibNames)if (resource.includes(`/node_modules/${libName}/`) || resource.includes(`\\node_modules\\${libName}\\`)) this.usedExternals.add(libName);
                            }
                        }
                    });
                    const HtmlWebpackPlugin = compiler.webpack.HtmlWebpackPlugin || compiler.options.plugins.find((p)=>"HtmlWebpackPlugin" === p.constructor.name)?.constructor;
                    if (!HtmlWebpackPlugin) return;
                    const hooks = HtmlWebpackPlugin.getHooks(compilation);
                    hooks.alterAssetTags.tap("AutoExternalPlugin", (data)=>{
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
                        data.assetTags.scripts.unshift(...tags);
                        return data;
                    });
                });
            }
        }
        async function page_pack(args) {
            const config = (0, src_config.eP)(args);
            const { entries, externals } = prepare_config(args, "page", config);
            if (!entries) return;
            const workspaceRoot = find_workspace_root(process.cwd());
            const rsbuildConfig = core_defineConfig({
                source: {
                    define: config.define,
                    entry: entries
                },
                plugins: [
                    framework_plugin(args),
                    pluginLess()
                ],
                tools: {
                    rspack: {
                        experiments: {
                            outputModule: true
                        },
                        plugins: [
                            new AutoExternalPlugin(args, config)
                        ]
                    },
                    htmlPlugin: true
                },
                output: {
                    assetPrefix: config.url.cdn || config.url.base,
                    distPath: {
                        root: config.output.dist
                    },
                    externals,
                    filenameHash: config.output.filenameHash,
                    legalComments: "none",
                    minify: config.minify
                },
                html: {
                    meta: config.html.meta,
                    mountId: config.html.root,
                    scriptLoading: "module",
                    tags: config.html.tags,
                    template: config.html.template || (0, external_node_path_.resolve)(get_package_root(), "template/index.html"),
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
            console.log('Dev Server Config:', JSON.stringify(rsbuildConfig.server, null, 2));
            const rsbuild = await createRsbuild({
                rsbuildConfig
            });
            if ("dev" === args.cmd) await rsbuild.startDevServer();
            else if ("preview" === args.cmd) await rsbuild.preview();
            else await rsbuild.build({
                watch: args.pack.watch
            });
            if ("build" === args.cmd) console.log(external_picocolors_["default"].green("\n**** 构建【page】完成 ****"));
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
    }
};
