import minimist from "minimist";
import { cwd, exit } from "node:process";
import picocolors from "picocolors";
import node_fs, { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import node_path, { dirname, join, resolve } from "node:path";
import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
import { fileURLToPath } from "node:url";
const default_dev_server_config = {
    open: false,
    port: 8080,
    proxy: {}
};
const default_html_config = {
    meta: {
        viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover'
    },
    root: 'app',
    tags: [],
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
    filenameHash: true,
    modules: 'modules',
    pages: ''
};
const default_ui_libs = {
    react: '17.0.2',
    vue: '2.7.16'
};
const default_url_config = {
    base: '/',
    cdn: ''
};
const default_config = {
    analyze: false,
    define: {},
    dev_server: default_dev_server_config,
    externals: [],
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
let args_args;
function get_args() {
    if (!args_args) {
        const argv = minimist(process.argv.slice(2));
        const cmd = get_cmd(argv);
        const preset = argv.preset;
        preset && PANIC_IF('react' !== preset && 'vue' !== preset, '目前只支持react和vue');
        args_args = {
            cmd,
            create_config: {
                force: 'true' === argv.force || argv.f,
                name: argv.name,
                preset
            },
            debug: 'true' === argv.debug,
            pack: {
                config_file: argv.config || default_config_file_name,
                mode: 'build' === cmd || 'dev' === cmd ? get_mode(argv, cmd) : 'prd'
            },
            verbose: 'true' === argv.verbose
        };
        args_args.pack.mode && set_node_env(args_args.pack.mode);
        if (args_args.verbose) console.log('args: ', args_args);
    }
    return args_args;
}
const example_externals = [
    {
        global: 'Vue',
        importName: [
            'vue',
            'Vue'
        ],
        name: 'vue',
        preset: 'vue',
        publicPath: false,
        url: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js'
    },
    {
        global: 'React',
        importName: [
            'react',
            'React'
        ],
        name: 'react',
        preset: 'react',
        publicPath: false,
        url: 'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js'
    },
    {
        global: 'ReactDOM',
        importName: 'react-dom',
        name: 'react-dom',
        preset: 'react',
        publicPath: false,
        url: 'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js'
    },
    {
        global: 'jQuery',
        importName: [
            'jquery',
            'jQuery'
        ],
        name: 'jQuery',
        publicPath: false,
        url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js'
    }
];
function create_config_file() {
    const args = get_args().create_config;
    const filename = args.name || default_config_file_name;
    console.log(picocolors.blue('即将创建配置文件'), filename);
    const filepath = resolve(process.cwd(), filename);
    if (existsSync(filepath)) if (!args.force) return void console.log(picocolors.red('配置文件已存在，跳过'));
    else console.log(picocolors.bgRed(picocolors.white('配置文件已存在，将强制覆盖')));
    writeFileSync(filepath, JSON.stringify({
        dev_server: default_config.dev_server,
        externals: example_externals.filter((item)=>item.preset === args.preset || !item.preset),
        html: {
            title: 'Modulo Page'
        },
        input: {
            modules: default_config.input.modules,
            pages: default_config.input.pages
        },
        output: {
            filenameHash: true
        },
        url: {
            base: '/'
        }
    }, null, 2));
    console.log(picocolors.green('创建成功'), filepath);
}
const logFile = join(process.cwd(), 'modulo.debug.log');
let index = 0;
let debug_log_function;
function debug_log(_hint, ..._params) {
    if (!debug_log_function) {
        const args = get_args();
        debug_log_function = (hint, ...params)=>{
            if (args.debug || args.verbose) {
                const timestamp = new Date().toISOString();
                const sn = String(index++).padStart(3, '0');
                const logEntry = `--------------\n${sn} [${timestamp}] ${hint}\n${params.map((p)=>'object' == typeof p ? JSON.stringify(p, null, 2) : String(p)).join('\n')}\n---------------\n\n`;
                if (args.verbose) console.log(logEntry);
                if (args.debug) {
                    console.log(picocolors.blue(`\ndebug log ${sn}`));
                    appendFileSync(logFile, logEntry);
                }
            }
        };
    }
    debug_log_function(_hint, ..._params);
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
    for(const key in input)if (key in target) {
        const _path = [
            ...path,
            key
        ];
        const error_msg = `${_path.join('->')}处的类型与要求不一致, 请参考说明文档的默认配置`;
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
            'object' == typeof to ? merge_user_config(to, from, _path) : target[key] = from;
        }
    }
}
const config_root = cwd();
let config_packagejson = null;
function get_packagejson() {
    if (!config_packagejson) {
        config_packagejson = jsonparse(resolve_and_read(config_root, 'package.json'));
        PANIC_IF(!config_packagejson, '根目录下没有package.json');
        PANIC_IF(!config_packagejson.name, 'package.json缺少name字段');
        debug_log('package.json', config_packagejson);
    }
    return config_packagejson;
}
let config_global_config;
function get_global_config() {
    if (!config_global_config) {
        const args = get_args().pack;
        const user_config = jsonparse(resolve_and_read(config_root, args.config_file));
        PANIC_IF(!user_config, '根目录下没有配置文件');
        debug_log('input user config', user_config);
        merge_user_config(default_config, user_config);
        const _config = default_config;
        const src = resolve(config_root, _config.input.src);
        const input = {
            modules: resolve(src, _config.input.modules),
            pages: resolve(src, _config.input.pages),
            src: src
        };
        const dist = resolve(config_root, _config.output.dist);
        const output = {
            ..._config.output,
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
    }
    return config_global_config;
}
let get_ui_lib_framework_name;
function get_framework_name() {
    if (!get_ui_lib_framework_name) {
        const { dependencies } = get_packagejson();
        PANIC_IF(!('vue' in dependencies || 'react' in dependencies), 'package.json中未识别到支持的ui库信息, 当前只支持vue和react');
        get_ui_lib_framework_name = 'vue' in dependencies ? 'vue' : 'react';
    }
    return get_ui_lib_framework_name;
}
function collect_modules(kind) {
    const global_config = get_global_config();
    const framework_name = get_framework_name();
    const module_path = global_config.input[kind];
    const exist = existsSync(module_path);
    debug_log(picocolors.blue('check module_path'), module_path, exist ? 'exists' : 'NOT exists');
    const module_entries = exist ? readdirSync(module_path, {
        withFileTypes: true
    }).filter((item)=>{
        debug_log('checking module is directory', item.name, item.isDirectory());
        return item.isDirectory();
    }).map((dirent)=>{
        const dir_path = resolve(module_path, dirent.name);
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
            const exists = existsSync(path);
            debug_log('checking entry candidate', `${path} ${picocolors[exists ? 'green' : 'red'](`exists - ${exists}`)}`);
            return exists;
        });
        debug_log('found entry', entry_file_path);
        return [
            dirent.name,
            entry_file_path
        ];
    }).filter((entry)=>!!entry[1]) : [];
    return module_entries.length > 0 ? Object.fromEntries(module_entries) : void 0;
}
let external_and_tags;
function get_externals_and_tags(external_list) {
    if (!external_and_tags) external_and_tags = external_list.reduce(({ externals, htmlTags }, external)=>{
        const importNames = Array.isArray(external.importName) ? external.importName : [
            external.importName
        ];
        importNames.forEach((importName)=>{
            externals[importName] = external.global;
        });
        htmlTags.push({
            append: false,
            attrs: {
                src: external.url
            },
            hash: false,
            head: true,
            publicPath: external.publicPath,
            tag: "script"
        });
        return {
            externals,
            htmlTags
        };
    }, {
        externals: {},
        htmlTags: []
    });
    return external_and_tags;
}
function framework_plugin(options) {
    const { dependencies } = get_packagejson();
    const framework_name = get_framework_name();
    const version = dependencies[framework_name];
    const global_config = get_global_config();
    PANIC_IF(global_config.ui_lib[framework_name] !== version, 'package.json中只允许使用固定版本号, 并且只支持vue-2.7.16和react-17.0.2');
    return 'vue' === framework_name ? pluginVue2(options) : pluginReact(options);
}
async function lib_pack(cmd) {
    const config = get_global_config();
    const packagejson = get_packagejson();
    console.log(picocolors.blueBright('\n**** 开始构建 【module】 ****\n'));
    const module_entries = collect_modules('modules');
    console.log(picocolors.blue('\nmodule entries: '), module_entries);
    if (!module_entries) return console.log(picocolors.red('\n没有要构建的模块，跳过'));
    const { externals } = get_externals_and_tags(config.externals);
    const umd_dist_dir = resolve(config.output.modules, 'umd');
    const rslibConfig = defineConfig({
        lib: [
            {
                format: 'umd',
                output: {
                    assetPrefix: `${config.url.base}/modules/umd`,
                    distPath: {
                        root: umd_dist_dir
                    },
                    externals,
                    minify: config.minify && {
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
            bundleAnalyze: config.analyze ? {
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
                '@': config.input.src
            }
        },
        source: {
            define: config.define,
            entry: module_entries
        }
    });
    await build(rslibConfig, {
        watch: 'dev' === cmd
    });
    if ('build' === cmd) console.log(picocolors.green('\n**** 构建【module】完成 ****\n'));
}
let packageRoot = '';
function get_package_root() {
    if (!packageRoot) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        let currentDir = node_path.resolve(__dirname);
        const root = node_path.parse(currentDir).root;
        while(currentDir !== root){
            const potentialPkgJson = node_path.join(currentDir, 'package.json');
            if (node_fs.existsSync(potentialPkgJson)) break;
            currentDir = node_path.dirname(currentDir);
        }
        debug_log('packageRoot', currentDir);
        packageRoot = currentDir;
    }
    return packageRoot;
}
async function page_pack(cmd) {
    const config = get_global_config();
    console.log(picocolors.blueBright('\n**** 开始构建 【page】 ****'));
    const page_entries = collect_modules('pages');
    console.log(picocolors.blue('\n\npage entries: '), page_entries, picocolors.blue('\nbase path'), config.url.base);
    if (!page_entries) return console.log(picocolors.red('\n没有要构建的页面，跳过'));
    const { externals, htmlTags } = get_externals_and_tags(config.externals);
    const rsbuildConfig = core_defineConfig({
        html: {
            meta: config.html.meta,
            mountId: config.html.root,
            tags: [
                ...htmlTags,
                ...config.html.tags
            ],
            template: config.html.template || resolve(get_package_root(), 'template/index.html'),
            templateParameters: {
                base_prefix: config.url.base
            },
            title: config.html.title
        },
        output: {
            assetPrefix: config.url.cdn || config.url.base,
            distPath: {
                root: config.output.dist
            },
            externals,
            filenameHash: config.output.filenameHash,
            legalComments: 'none',
            minify: config.minify && {
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
                '@': config.input.src
            }
        },
        server: {
            base: config.url.base,
            open: config.dev_server.open ? config.dev_server.open.map((name)=>config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`)) : false,
            port: config.dev_server.port,
            proxy: config.dev_server.proxy
        },
        source: {
            define: {
                'import.meta.env.MOUNT_ID': config.html.root,
                ...config.define
            },
            entry: page_entries
        }
    });
    const rsbuild = await createRsbuild({
        rsbuildConfig
    });
    await rsbuild['dev' === cmd ? 'startDevServer' : 'build']();
    if ('build' === cmd) console.log(picocolors.green('\n**** 构建【page】完成 ****'));
}
async function pack_code(cmd) {
    await page_pack(cmd);
    await lib_pack(cmd);
}
function exec() {
    const args = get_args();
    if ('create-config' === args.cmd) create_config_file();
    else if ('build' === args.cmd || 'dev' === args.cmd) pack_code(args.cmd);
}
export { exec };
