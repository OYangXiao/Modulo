import { build, defineConfig } from "@rslib/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { cwd, exit } from "node:process";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
import { fileURLToPath } from "node:url";
const key_name_map = {
    config: 'config_file'
};
const arg_value_options = {
    action: [
        'build',
        'dev'
    ],
    target: [
        'all',
        'page',
        'lib'
    ],
    debug: [
        'false',
        'true'
    ],
    config_file: void 0
};
const default_args = {
    debug: arg_value_options.debug[0],
    action: arg_value_options.action[0],
    target: arg_value_options.target[0],
    config_file: 'modulo.config.json'
};
const args = Object.assign(default_args, Object.fromEntries(process.argv.filter((arg)=>'build' === arg || 'dev' === arg || arg.startsWith('--')).map((arg)=>arg.startsWith('--') ? arg.slice(2) : `action=${arg}`).map((arg)=>{
    const index = arg.indexOf('=');
    const key = arg.slice(0, index);
    const value = arg.slice(index + 1);
    const inner_key = key_name_map[key] || (key in default_args ? key : void 0);
    if (!inner_key) return;
    const value_options = arg_value_options[inner_key];
    if (void 0 === value_options || value_options.includes(value)) return [
        inner_key,
        value
    ];
}).filter((v)=>!!v)));
if ('true' === args.debug) console.log('args: ', args);
function jsonparse(input) {
    try {
        return JSON.parse(input);
    } catch (e) {
        console.error(`JSON.parse failed\n${e}`);
    }
}
const default_externals = {
    vue: {
        vue: 'Vue'
    },
    react: {
        react: 'React',
        React: 'React',
        'react-dom': 'ReactDOM',
        'react/jsx-runtime': 'ReactJsxRuntime'
    }
};
const common_externals = {
    jquery: 'jQuery',
    moment: 'moment'
};
function if_then_alert_and_exit(status, msg) {
    if (status) {
        const alert = '\n\n！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！\n\n';
        console.error(`${alert}${msg}${alert}`);
        exit(1);
    }
}
function get_file(path, error_msg) {
    try {
        return readFileSync(path, "utf8");
    } catch  {
        console.log(error_msg || `文件无法访问或者不存在: ${path}`);
        return "";
    }
}
const debug_mode = "true" === args.debug;
const root_dir = cwd();
const packagejson_path = resolve(root_dir, "package.json");
if (debug_mode) console.log("packagejson_path", packagejson_path);
const packagejson = JSON.parse(get_file(packagejson_path));
if (debug_mode) console.log("packagejson", packagejson);
if_then_alert_and_exit(!packagejson.name, "必须要在package.json中提供name字段作为工程部署信息");
const config_file_path = resolve(root_dir, args.config_file);
if (debug_mode) console.log("config_file_path", config_file_path);
const config_file_content = get_file(config_file_path, "没有项目配置文件，使用默认设置");
if (debug_mode) console.log("config_file_content", config_file_content);
const user_config = (config_file_content ? jsonparse(config_file_content) : {}) || {};
const src_dir = resolve(root_dir, user_config.src_dir || "src");
const dir_name_config = Object.assign({
    pages: "pages",
    components: "components",
    functions: "functions"
}, user_config.dir_names || {});
if (debug_mode) console.log("dir_name_config", dir_name_config);
const dist_dir_name = user_config.dist_dir || "dist";
const dist_dir = resolve(root_dir, dist_dir_name);
const html_mount_id = user_config.html_mount_id || "app";
const html_title = user_config.html_title || "新涨乐";
const deps = packagejson.dependencies;
const _ui_lib_name = "vue" in deps ? "vue" : "react" in deps ? "react" : void 0;
if_then_alert_and_exit(!_ui_lib_name, "package.json中未识别到支持的ui库信息");
const ui_lib_name = _ui_lib_name;
const regex = /(?<=["']?[~^><=]*)(\d+)(?=\.|x|["']|\s|$)/;
const version = deps[ui_lib_name];
const match = version.match(regex);
const ui_lib_major_version = match ? Number.parseInt(match[0], 10) : void 0;
const dev_server_config = Object.assign({
    port: 8080,
    open: void 0,
    proxy: void 0
}, user_config.dev_server || {});
const base_prefix = user_config.base_prefix || "/";
const base_path = user_config.base_path || `${base_prefix}/${packagejson.name}`;
dev_server_config.port = Number.isInteger(dev_server_config.port) ? dev_server_config.port : 8080;
if_then_alert_and_exit(!!dev_server_config.open && !Array.isArray(dev_server_config.open), "配置文件中dev_server_open必须是字符串数组");
const cdn_domain = user_config.cdn_domain || '';
const lib_externals = user_config.lib_externals || {};
if_then_alert_and_exit("object" != typeof lib_externals, "配置文件中lib_externals必须是对象");
Object.assign(lib_externals, common_externals, default_externals[ui_lib_name]);
if (!process.env.NODE_ENV) process.env.NODE_ENV = "build" === args.action ? "production" : "development";
console.log(`\n当前模式: ${process.env.NODE_ENV}\n`);
const enable_bundle_analyze = user_config.bundle_analyze || false;
console.log(`\n当前是否启用bundle-analyze: ${enable_bundle_analyze}\n`);
const minify = "boolean" == typeof user_config.minify ? user_config.minify : "production" === process.env.NODE_ENV || "build" === args.action;
const settings_define = Object.assign({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
}, user_config.define || {});
function first_letter_upper(str) {
    return `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
}
async function get_ui_lib_plugin() {
    const first_upper_name = first_letter_upper(ui_lib_name);
    const version_appendix = 'vue' === ui_lib_name ? ui_lib_major_version : '';
    const ui_plugin = (await import(`@rsbuild/plugin-${ui_lib_name}${version_appendix}`))[`plugin${first_upper_name}${version_appendix}`];
    return ui_plugin;
}
const module_kinds = [
    'pages',
    'components',
    'functions'
];
const collected_modules = Object.fromEntries(module_kinds.map((kind)=>{
    const module_dir = resolve(src_dir, dir_name_config[kind]);
    if (debug_mode) console.log('checking module dir', module_dir, existsSync(module_dir) ? 'exists' : 'NOT exists');
    const module_entries = existsSync(module_dir) ? readdirSync(module_dir, {
        withFileTypes: true
    }).filter((item)=>{
        if (debug_mode) console.log('checking module is directory', item.name, item.isDirectory());
        return item.isDirectory();
    }).map((dirent)=>{
        const dir_path = resolve(module_dir, dirent.name);
        if (debug_mode) console.log('checking module dir path', dir_path);
        const entry_file_path = [
            resolve(dir_path, 'index.ts'),
            resolve(dir_path, 'index.tsx'),
            resolve(dir_path, 'index.js'),
            resolve(dir_path, 'index.jsx'),
            resolve(dir_path, 'main.ts'),
            resolve(dir_path, 'main.tsx'),
            resolve(dir_path, 'main.js'),
            resolve(dir_path, 'main.jsx'),
            ...'vue' === ui_lib_name ? [
                resolve(dir_path, 'index.vue'),
                resolve(dir_path, 'main.vue'),
                resolve(dir_path, `${dirent.name}.vue`)
            ] : [],
            resolve(dir_path, `${dirent.name}.ts`),
            resolve(dir_path, `${dirent.name}.tsx`),
            resolve(dir_path, `${dirent.name}.js`),
            resolve(dir_path, `${dirent.name}.jsx`)
        ].find((path)=>{
            if (debug_mode) console.log('checking entry path', path);
            return existsSync(path);
        });
        return [
            dirent.name,
            entry_file_path
        ];
    }).filter((entry)=>!!entry[1]) : [];
    return [
        kind,
        module_entries.length > 0 ? Object.fromEntries(module_entries) : void 0
    ];
}));
async function lib_builder() {
    for (const kind of [
        "components",
        "functions"
    ]){
        const ui_plugin = await get_ui_lib_plugin();
        console.log(`\n${kind} module entries: `, collected_modules[kind], "\nmodule output minify: ", minify, "\nprocess.env.NODE_ENV", process.env.NODE_ENV);
        if (!collected_modules[kind]) return console.log(`没有要构建的${"components" === kind ? "组件" : "函数"}模块`);
        const umd_dist_dir = resolve(dist_dir, `modules/${kind}/umd`);
        const rslibConfig = defineConfig({
            plugins: [
                ui_plugin(),
                pluginLess()
            ],
            resolve: {
                alias: {
                    "@": src_dir
                }
            },
            source: {
                entry: collected_modules[kind],
                define: settings_define
            },
            lib: [
                {
                    format: "umd",
                    umdName: `${packagejson.name}-modules-${kind}-[name]`,
                    syntax: "es6",
                    output: {
                        externals: lib_externals,
                        distPath: {
                            root: umd_dist_dir
                        },
                        assetPrefix: `${base_path}/modules/${kind}/umd`,
                        minify: minify ? {
                            js: true,
                            jsOptions: {
                                minimizerOptions: {
                                    mangle: true,
                                    minify: true,
                                    compress: {
                                        defaults: false,
                                        unused: true,
                                        dead_code: true,
                                        toplevel: true
                                    },
                                    format: {
                                        comments: "some",
                                        preserve_annotations: true,
                                        safari10: true,
                                        semicolons: false,
                                        ecma: 2015
                                    }
                                }
                            }
                        } : false
                    }
                }
            ],
            output: {
                target: "web",
                legalComments: "none",
                cssModules: {
                    exportGlobals: true
                }
            },
            performance: {
                bundleAnalyze: enable_bundle_analyze ? {
                    analyzerMode: "disabled",
                    generateStatsFile: true
                } : void 0,
                chunkSplit: {
                    strategy: "all-in-one"
                }
            }
        });
        await build(rslibConfig, {
            watch: "dev" === args.action
        });
    }
}
const page_builder_filename = fileURLToPath(import.meta.url);
const page_builder_dirname = dirname(page_builder_filename);
async function page_builder() {
    const ui_plugin = await get_ui_lib_plugin();
    console.log('\npage entries: ', collected_modules.pages);
    console.log('\nbase prefix', base_prefix);
    console.log('\nbase path', base_path);
    if (!collected_modules.pages) return console.log('没有要构建的页面');
    const rsbuildConfig = core_defineConfig({
        plugins: [
            ui_plugin(),
            pluginLess()
        ],
        resolve: {
            alias: {
                '@': src_dir
            }
        },
        source: {
            entry: collected_modules.pages,
            define: {
                'import.meta.env.MOUNT_ID': html_mount_id,
                ...settings_define
            }
        },
        output: {
            distPath: {
                root: dist_dir
            },
            legalComments: 'none',
            assetPrefix: cdn_domain + base_path,
            minify: minify ? {
                js: true,
                jsOptions: {
                    minimizerOptions: {
                        mangle: true,
                        minify: true,
                        compress: {
                            defaults: false,
                            unused: true,
                            dead_code: true,
                            toplevel: true
                        },
                        format: {
                            comments: 'some',
                            preserve_annotations: true,
                            safari10: true,
                            semicolons: false,
                            ecma: 2015
                        }
                    }
                }
            } : false
        },
        html: {
            mountId: html_mount_id,
            title: html_title,
            templateParameters: {
                base_prefix: base_prefix
            },
            meta: {
                viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover'
            },
            template: resolve(page_builder_dirname, '../template.html')
        },
        server: {
            port: dev_server_config.port,
            base: base_path,
            open: dev_server_config.open?.map((name)=>dev_server_config.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`)),
            ...dev_server_config.proxy ? {
                proxy: dev_server_config.proxy
            } : {}
        }
    });
    const rsbuild = await createRsbuild({
        rsbuildConfig
    });
    await rsbuild['dev' === args.action ? 'startDevServer' : 'build']();
}
if ('page' === args.target || 'all' === args.target) page_builder();
if ('lib' === args.target || 'all' === args.target) lib_builder();
