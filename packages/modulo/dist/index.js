import minimist from "minimist";
import { cwd, exit } from "node:process";
import picocolors from "picocolors";
import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import { fileURLToPath } from "node:url";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
const default_dev_server_config = {
    open: void 0,
    port: 8080,
    proxy: {}
};
const default_externals = {
    jquery: 'jQuery',
    react: 'React',
    'react-dom': 'ReactDOM',
    vue: 'Vue',
    'vue-router': 'VueRouter'
};
const default_html_config = {
    meta: {
        viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover'
    },
    root: 'app',
    tags: [
        {
            append: false,
            attrs: {
                src: '/common/js/webhost.js'
            },
            hash: false,
            head: true,
            publicPath: true,
            tag: "script"
        }
    ],
    template: '',
    title: ''
};
const default_input_dirs = {
    modules: 'modules',
    pages: 'pages',
    src: 'src'
};
const default_output_dirs = {
    dist: 'dist',
    modules: 'modules',
    pages: ''
};
const default_ui_libs = {
    react: '17.0.2',
    vue: '2.7.16'
};
const default_url_config = {
    base: './',
    cdn: ''
};
const default_config = {
    analyze: false,
    define: {},
    dev_server: default_dev_server_config,
    externals: default_externals,
    html: default_html_config,
    input: default_input_dirs,
    minify: void 0,
    output: default_output_dirs,
    ui_lib: default_ui_libs,
    url: default_url_config
};
const default_config_file_name = 'modulo.config.json';
const panic_alert = '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !';
function PANIC_IF(status = false, msg = "SOMETHING'S WRONG", halt = true) {
    if (status) {
        console.log(picocolors.bgRed(picocolors.white(`\n${panic_alert}\n\n${msg}\n\n${panic_alert}`)), '\n');
        halt && exit(1);
    }
}
function get_cmd(argv) {
    const cmd_list = [
        'build',
        'dev',
        'create-config'
    ];
    const cmd = argv._[0];
    PANIC_IF(!cmd_list.includes(cmd), `modulo必须执行 ${cmd_list.join(' 或 ')} 命令`);
    return cmd;
}
const mode_list = [
    'dev',
    'development',
    'prd',
    'production'
];
function get_mode(argv, cmd) {
    let mode = '';
    if (argv.mode) {
        if ('dev' === argv.mode || 'development' === argv.mode) mode = 'dev';
        else if ('prd' === argv.mode || 'production' === argv.mode) mode = 'prd';
        else PANIC_IF(true, `mode参数只能为 ${mode_list.join(' 或 ')}`);
        console.log(picocolors.blue(`mode = ${mode}`));
    } else if ('build' === cmd || 'dev' === cmd) if (process.env.NODE_ENV) {
        mode = 'production' === process.env.NODE_ENV ? 'prd' : 'dev';
        console.log(picocolors.yellow('\n未设置mode，将根据process.env.NODE_ENV自动设置\n'), picocolors.yellow(`process.env.NODE_ENV = ${process.env.NODE_ENV}, mode = ${mode}`));
    } else {
        mode = 'build' === cmd ? 'prd' : 'dev';
        console.log(picocolors.yellow('\n未设置mode，将根据build或dev命令自动设置\n'), picocolors.yellow(`cmd = ${cmd}, mode = ${mode}`));
    }
    return mode;
}
function set_node_env(mode) {
    const _node_env = 'dev' === mode ? 'development' : 'production';
    if (process.env.NODE_ENV !== _node_env) {
        console.log(picocolors.yellow('\nprocess.env.NODE_ENV 与 mode 不一致, 将被强制设置为与mode匹配的值\n'), picocolors.yellow(`mode = ${mode}, process.env.NODE_ENV = ${_node_env}\n`));
        process.env.NODE_ENV = _node_env;
    }
}
const args_argv = minimist(process.argv.slice(2));
const args_cmd = get_cmd(args_argv);
const args = {
    cmd: args_cmd,
    config_file: args_argv.config || default_config_file_name,
    debug: 'true' === args_argv.debug,
    mode: 'build' === args_cmd || 'dev' === args_cmd ? get_mode(args_argv, args_cmd) : '',
    name: args_argv.name,
    verbose: 'true' === args_argv.verbose
};
args.mode && set_node_env(args.mode);
if (args.verbose) console.log('args: ', args);
function create_config_file() {
    const filename = args.name || default_config_file_name;
    console.log(picocolors.blue('即将创建配置文件'), filename);
    if (existsSync(filename)) return void console.log(picocolors.bgRed(picocolors.white('配置文件已存在')));
    const filepath = resolve(process.cwd(), filename);
    writeFileSync(filepath, JSON.stringify({
        dev_server: default_config.dev_server,
        html: {
            title: 'Modulo Page'
        },
        input: {
            modules: default_config.input.modules,
            pages: default_config.input.pages
        }
    }, null, 2));
    console.log(picocolors.green('创建成功'), filepath);
}
const logFile = join(process.cwd(), 'modulo.debug.log');
let index = 0;
function debug_log(hint, ...params) {
    if (args.debug || args.verbose) {
        const timestamp = new Date().toISOString();
        const sn = String(index++).padStart(3, '0');
        const logEntry = `\n${sn} [${timestamp}] ${hint}\n${params.map((p)=>'object' == typeof p ? JSON.stringify(p, null, 2) : String(p)).join('\n')}\n---------------\n\n`;
        if (args.verbose) console.log(logEntry);
        if (args.debug) {
            console.log(picocolors.blue(`\ndebug log ${sn}`));
            appendFileSync(logFile, logEntry);
        }
    }
}
function read_file(path, error_msg) {
    try {
        return readFileSync(path, 'utf8');
    } catch  {
        console.log(picocolors.red(error_msg || `文件无法访问或者不存在: ${path}`));
        return '';
    }
}
function resolve_and_read(root, name) {
    const fullpath = resolve(root, name);
    debug_log(`resolve file: ${name}`, 'result is:', fullpath);
    return read_file(fullpath);
}
function jsonparse(input) {
    try {
        if (input) return JSON.parse(input);
    } catch (e) {
        console.error(picocolors.red(`JSON.parse failed\n${e}`));
    }
}
function merge_user_config(target, input, path = []) {
    for(const key in input){
        console.log('input key', key);
        if (key in target) {
            path.push(key);
            console.log('path', path);
            const error_msg = `${path.join('->')}处的类型与要求不一致, 请参考说明文档的默认配置`;
            const from = input[key];
            const to = target[key];
            if (Array.isArray(to)) {
                PANIC_IF(!Array.isArray(from), error_msg);
                target[key] = [
                    ...to,
                    ...from
                ];
            } else {
                PANIC_IF(typeof from !== typeof to, error_msg);
                target[key] = 'object' == typeof to ? merge_user_config(from, to, path) : from;
            }
        }
    }
    return target;
}
const config_root = cwd();
const packagejson = jsonparse(resolve_and_read(config_root, 'package.json'));
PANIC_IF(!packagejson, '根目录下没有package.json');
debug_log('package.json', packagejson);
let config_global_config;
function get_global_config() {
    if (config_global_config) return config_global_config;
    const user_config = jsonparse(resolve_and_read(config_root, args.config_file));
    PANIC_IF(!user_config, '根目录下没有配置文件');
    debug_log('input user config', user_config);
    const _config = merge_user_config(default_config, user_config);
    debug_log('merged config', _config);
    const src = resolve(config_root, _config.input.src);
    const input = {
        modules: resolve(src, _config.input.modules),
        pages: resolve(src, _config.input.pages),
        src: src
    };
    const dist = resolve(config_root, _config.output.dist);
    const output = {
        dist: dist,
        modules: resolve(dist, _config.output.modules),
        pages: resolve(dist, _config.output.pages)
    };
    const html = _config.html?.template ? {
        ..._config.html,
        template: resolve(config_root, _config.html.template)
    } : _config.html;
    const define = {
        ...Object.fromEntries(Object.entries(_config.define).map(([k, v])=>[
                k,
                JSON.stringify(v)
            ])),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    };
    debug_log('当前模式', process.env.NODE_ENV);
    const minify = 'boolean' == typeof _config.minify ? _config.minify : 'production' === process.env.NODE_ENV;
    config_global_config = {
        ..._config,
        define,
        html,
        input,
        minify,
        output
    };
    debug_log('global config', config_global_config);
    return config_global_config;
}
const { dependencies } = packagejson;
PANIC_IF(!('vue' in dependencies || 'react' in dependencies), 'package.json中未识别到支持的ui库信息, 当前只支持vue和react');
const framework_name = 'vue' in dependencies ? 'vue' : 'react';
function framework_plugin(options) {
    const version = dependencies[framework_name];
    const global_config = get_global_config();
    PANIC_IF(global_config.ui_lib[framework_name] !== version, 'package.json中只允许使用固定版本号, 并且只支持vue-2.7.16和react-17.0.2');
    return 'vue' === framework_name ? pluginVue2(options) : pluginReact(options);
}
const module_kinds = [
    'pages',
    'modules'
];
function collect_modules() {
    const global_config = get_global_config();
    return Object.fromEntries(module_kinds.map((kind)=>{
        const module_path = global_config.input[kind];
        const exist = existsSync(module_path);
        debug_log('check module_path', module_path, exist ? 'exists' : 'NOT exists');
        const module_entries = exist ? readdirSync(module_path, {
            withFileTypes: true
        }).filter((item)=>{
            debug_log('checking module is directory', item.name, item.isDirectory());
            return item.isDirectory();
        }).map((dirent)=>{
            const dir_path = resolve(module_path, dirent.name);
            debug_log('checking module dir path', dir_path);
            const entry_file_path = [
                resolve(dir_path, 'index.ts'),
                resolve(dir_path, 'index.tsx'),
                resolve(dir_path, 'index.js'),
                resolve(dir_path, 'index.jsx'),
                resolve(dir_path, 'main.ts'),
                resolve(dir_path, 'main.tsx'),
                resolve(dir_path, 'main.js'),
                resolve(dir_path, 'main.jsx'),
                ...'vue' === framework_name ? [
                    resolve(dir_path, 'index.vue'),
                    resolve(dir_path, 'main.vue'),
                    resolve(dir_path, `${dirent.name}.vue`)
                ] : [],
                resolve(dir_path, `${dirent.name}.ts`),
                resolve(dir_path, `${dirent.name}.tsx`),
                resolve(dir_path, `${dirent.name}.js`),
                resolve(dir_path, `${dirent.name}.jsx`)
            ].find((path)=>{
                debug_log('checking entry path', path);
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
}
async function lib_pack(cmd) {
    const global_config = get_global_config();
    const collected_modules = collect_modules();
    console.log(picocolors.blueBright('\n**** 开始构建 【module】 ****\n'), picocolors.blue('\nmodule entries: '), collected_modules.modules);
    if (!collected_modules.modules) return console.log(picocolors.red('\n没有要构建的模块，跳过'));
    const umd_dist_dir = resolve(global_config.output.modules, 'umd');
    const rslibConfig = defineConfig({
        lib: [
            {
                format: 'umd',
                output: {
                    assetPrefix: `${global_config.url.base}/modules/umd`,
                    distPath: {
                        root: umd_dist_dir
                    },
                    externals: global_config.externals,
                    minify: global_config.minify && {
                        js: true,
                        jsOptions: {
                            minimizerOptions: {
                                compress: {
                                    dead_code: true,
                                    defaults: false,
                                    toplevel: true,
                                    unused: true
                                },
                                format: {
                                    comments: 'some',
                                    ecma: 2015,
                                    preserve_annotations: true,
                                    safari10: true,
                                    semicolons: false
                                },
                                mangle: true,
                                minify: true
                            }
                        }
                    }
                },
                syntax: 'es6',
                umdName: `${packagejson.name}-modules-[name]`
            }
        ],
        output: {
            legalComments: 'none',
            target: 'web'
        },
        performance: {
            bundleAnalyze: global_config.analyze ? {
                analyzerMode: 'disabled',
                generateStatsFile: true
            } : void 0,
            chunkSplit: {
                strategy: 'all-in-one'
            }
        },
        plugins: [
            framework_plugin(),
            pluginLess()
        ],
        resolve: {
            alias: {
                '@': global_config.input.src
            }
        },
        source: {
            define: global_config.define,
            entry: collected_modules.modules
        }
    });
    await build(rslibConfig, {
        watch: 'dev' === cmd
    });
}
const page_filename = fileURLToPath(import.meta.url);
const page_dirname = dirname(page_filename);
async function page_pack(cmd) {
    const global_config = get_global_config();
    const collected_modules = collect_modules();
    console.log(picocolors.blueBright('\n**** 开始构建 【page】 ****'), picocolors.blue('\n\npage entries: '), collected_modules.pages, picocolors.blue('\nbase path'), global_config.url.base);
    if (!collected_modules.pages) return console.log(picocolors.red('\n没有要构建的页面，跳过'));
    const rsbuildConfig = core_defineConfig({
        html: {
            meta: global_config.html.meta,
            mountId: global_config.html.root,
            template: global_config.html.template || resolve(page_dirname, '../template.html'),
            templateParameters: {
                base_prefix: global_config.url.base
            },
            title: global_config.html.title
        },
        output: {
            assetPrefix: global_config.url.cdn || global_config.url.base,
            distPath: {
                root: global_config.output.dist
            },
            legalComments: 'none',
            minify: global_config.minify && {
                js: true,
                jsOptions: {
                    minimizerOptions: {
                        compress: {
                            dead_code: true,
                            defaults: false,
                            toplevel: true,
                            unused: true
                        },
                        format: {
                            comments: 'some',
                            ecma: 2015,
                            preserve_annotations: true,
                            safari10: true,
                            semicolons: false
                        },
                        mangle: true,
                        minify: true
                    }
                }
            }
        },
        plugins: [
            framework_plugin(),
            pluginLess()
        ],
        resolve: {
            alias: {
                '@': global_config.input.src
            }
        },
        server: {
            base: global_config.url.base,
            open: global_config.dev_server.open?.map((name)=>global_config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`)),
            port: global_config.dev_server.port,
            proxy: global_config.dev_server.proxy
        },
        source: {
            define: {
                'import.meta.env.MOUNT_ID': global_config.html.root,
                ...global_config.define
            },
            entry: collected_modules.pages
        }
    });
    const rsbuild = await createRsbuild({
        rsbuildConfig
    });
    await rsbuild['dev' === cmd ? 'startDevServer' : 'build']();
}
async function pack_code(cmd) {
    await page_pack(cmd);
    await lib_pack(cmd);
}
if ('create-config' === args.cmd) create_config_file();
else if ('build' === args.cmd || 'dev' === args.cmd) pack_code(args.cmd);
