import { build, defineConfig } from "@rslib/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { dirname, join, resolve } from "node:path";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import { cwd, exit } from "node:process";
import minimist from "minimist";
import picocolors from "picocolors";
import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
import { fileURLToPath } from "node:url";
const panic_alert = '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !';
function PANIC_IF(status = false, msg = "SOMETHING'S WRONG", halt = true) {
    if (status) {
        console.log(picocolors.bgRed(picocolors.white(`\n${panic_alert}\n\n${msg}\n\n${panic_alert}`)), '\n');
        halt && exit(1);
    }
}
const default_config_file_name = 'modulo.config.json';
const argv = minimist(process.argv.slice(2));
const cmd = argv._[0];
PANIC_IF(![
    'build',
    'dev'
].includes(cmd), 'modulo-pack必须执行build或者dev命令');
const args = {
    cmd,
    config_file: argv.config || default_config_file_name,
    debug: 'true' === argv.debug
};
const debug_mode = args.debug;
if (args.debug) console.log('args: ', args);
const logFile = join(process.cwd(), 'modulo.debug.log');
let index = 0;
function debug_log(hint, ...params) {
    if (debug_mode) {
        const timestamp = new Date().toISOString();
        const sn = String(index++).padStart(3, '0');
        const logEntry = `${sn} [${timestamp}] ${hint}\n${params.map((p)=>'object' == typeof p ? JSON.stringify(p, null, 2) : String(p)).join('\n')}\n---------------\n\n`;
        console.log(picocolors.blue(`\ndebug log ${sn}`));
        appendFileSync(logFile, logEntry);
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
const default_config = {
    analyze: false,
    define: {},
    dev_server: {
        open: void 0,
        port: 8080,
        proxy: {}
    },
    externals: {
        jquery: 'jQuery',
        react: 'React',
        'react-dom': 'ReactDOM',
        vue: 'Vue',
        'vue-router': 'VueRouter'
    },
    html: {
        meta: {
            viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover'
        },
        root: 'app',
        template: '',
        title: ''
    },
    input: {
        modules: 'modules',
        pages: 'pages',
        src: 'src'
    },
    minify: void 0,
    output: {
        dist: 'dist',
        modules: 'modules',
        pages: ''
    },
    ui_lib: {
        react: '17.0.2',
        vue: '2.7.16'
    },
    url: {
        base: '',
        cdn: ''
    }
};
function merge_user_config(target, input, path = []) {
    for(const key in input)if (key in target) {
        path.push(key);
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
    return target;
}
const config_root = cwd();
const packagejson = jsonparse(resolve_and_read(config_root, 'package.json'));
PANIC_IF(!packagejson, '根目录下没有package.json');
debug_log('package.json', packagejson);
const user_config = jsonparse(resolve_and_read(config_root, args.config_file));
PANIC_IF(!user_config, '根目录下没有配置文件');
debug_log('input user config', user_config);
const _config = merge_user_config(default_config, user_config);
const src = resolve(config_root, _config.input.src);
const config_input = {
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
if (!_config.define['process.env.NODE_ENV']) _config.define['process.env.NODE_ENV'] = process.env.NODE_ENV || 'build' === args.cmd ? 'production' : 'development';
const config_define = Object.fromEntries(Object.entries(_config.define).map(([k, v])=>[
        k,
        JSON.stringify(v)
    ]));
process.env.NODE_ENV = _config.define['process.env.NODE_ENV'];
debug_log('当前模式', process.env.NODE_ENV);
const minify = 'boolean' == typeof _config.minify ? user_config.minify : 'production' === process.env.NODE_ENV;
const global_config = {
    ..._config,
    define: config_define,
    html,
    input: config_input,
    minify,
    output
};
debug_log('global config', global_config);
const { dependencies } = packagejson;
PANIC_IF(!('vue' in dependencies || 'react' in dependencies), 'package.json中未识别到支持的ui库信息, 当前只支持vue和react');
const framework_name = 'vue' in dependencies ? 'vue' : 'react';
const version = dependencies[framework_name];
PANIC_IF(global_config.ui_lib[framework_name] !== version, 'package.json中只允许使用固定版本号, 并且只支持vue-2.7.16和react-17.0.2');
const framework_plugin = 'vue' === framework_name ? pluginVue2 : pluginReact;
const module_kinds = [
    'pages',
    'modules'
];
const collected_modules = Object.fromEntries(module_kinds.map((kind)=>{
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
async function lib_builder() {
    console.log('\nmodule entries: ', collected_modules.modules, '\nmodule output minify: ', global_config.minify, '\nprocess.env.NODE_ENV', process.env.NODE_ENV);
    if (!collected_modules.modules) return console.log('没有要构建的模块');
    const umd_dist_dir = resolve(global_config.output.modules, 'umd');
    const rslibConfig = defineConfig({
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
            entry: collected_modules.modules,
            define: global_config.define
        },
        lib: [
            {
                format: 'umd',
                umdName: `${packagejson.name}-modules-[name]`,
                syntax: 'es6',
                output: {
                    externals: global_config.externals,
                    distPath: {
                        root: umd_dist_dir
                    },
                    assetPrefix: `${global_config.url.base}/modules/umd`,
                    minify: global_config.minify && {
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
                    }
                }
            }
        ],
        output: {
            target: 'web',
            legalComments: 'none'
        },
        performance: {
            bundleAnalyze: global_config.analyze ? {
                analyzerMode: 'disabled',
                generateStatsFile: true
            } : void 0,
            chunkSplit: {
                strategy: 'all-in-one'
            }
        }
    });
    await build(rslibConfig, {
        watch: 'dev' === args.cmd
    });
}
const page_filename = fileURLToPath(import.meta.url);
const page_dirname = dirname(page_filename);
async function page_builder() {
    console.log('\npage entries: ', collected_modules.pages);
    console.log('\nbase path', global_config.url.base);
    if (!collected_modules.pages) return console.log('没有要构建的页面');
    const rsbuildConfig = core_defineConfig({
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
            entry: collected_modules.pages,
            define: {
                'import.meta.env.MOUNT_ID': global_config.html.root,
                ...global_config.define
            }
        },
        output: {
            distPath: {
                root: global_config.output.dist
            },
            legalComments: 'none',
            assetPrefix: global_config.url.cdn || global_config.url.base,
            minify: global_config.minify && {
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
            }
        },
        html: {
            mountId: global_config.html.root,
            title: global_config.html.title,
            templateParameters: {
                base_prefix: global_config.url.base
            },
            meta: global_config.html.meta,
            template: global_config.html.template || resolve(page_dirname, '../template.html')
        },
        server: {
            port: global_config.dev_server.port,
            base: global_config.url.base,
            open: global_config.dev_server.open?.map((name)=>global_config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`)),
            proxy: global_config.dev_server.proxy
        }
    });
    const rsbuild = await createRsbuild({
        rsbuildConfig
    });
    await rsbuild['dev' === args.cmd ? 'startDevServer' : 'build']();
}
page_builder();
lib_builder();
