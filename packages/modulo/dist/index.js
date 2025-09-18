import minimist from "minimist";
import picocolors from "picocolors";
import node_fs, { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import node_path, { dirname, join, resolve as external_node_path_resolve } from "node:path";
import node_readline from "node:readline";
import { cwd, exit } from "node:process";
import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginVue2 } from "@rsbuild/plugin-vue2";
import { createRsbuild, defineConfig as core_defineConfig } from "@rsbuild/core";
import { fileURLToPath } from "node:url";
import { pluginUmd } from "@rsbuild/plugin-umd";
const logFile = join(process.cwd(), "modulo.debug.log");
let index = 0;
let debug_log_function;
function debug_log(_hint, ..._params) {
    if (!debug_log_function) debug_log_function = (hint, ...params)=>{
        if (argv_debug || argv_verbose) {
            const timestamp = new Date().toISOString();
            const sn = String(index++).padStart(3, "0");
            const logEntry = `--------------\n${sn} [${timestamp}] ${hint}\n${params.map((p)=>"object" == typeof p ? JSON.stringify(p, null, 2) : String(p)).join("\n")}\n---------------\n\n`;
            if (argv_verbose) console.log(logEntry);
            if (argv_debug) {
                console.log(picocolors.blue(`\ndebug log ${sn}`));
                appendFileSync(logFile, logEntry);
            }
        }
    };
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
    const fullpath = external_node_path_resolve(root, name);
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
const panic_alert = '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !';
function PANIC_IF(status = false, msg = "SOMETHING'S WRONG", halt = true) {
    if (status) {
        console.log(picocolors.bgRed(picocolors.white(`\n${panic_alert}\n\n${msg}\n\n${panic_alert}`)), '\n');
        halt && exit(1);
    }
}
function merge_user_config(target, input) {
    for(const key in input){
        const from = input[key];
        const to = target[key];
        if (typeof from === typeof to && key in target) if (Array.isArray(to)) {
            PANIC_IF(!Array.isArray(from));
            target[key] = [
                ...to,
                ...from
            ];
        } else if ("object" == typeof to) merge_user_config(to, from);
        else target[key] = from;
        else {
            target[key] = from;
            continue;
        }
    }
}
const preset_alias = {
    "@": "{input.src}"
};
const preset_dev_server_config = {
    open: false,
    port: 8080,
    proxy: {}
};
const preset_input_dirs = {
    src: "src",
    pages: "pages",
    modules: "modules"
};
const preset_output_dirs = {
    dist: "dist",
    pages: "",
    modules: "modules",
    filenameHash: true
};
const default_html_config = {
    meta: {},
    root: '',
    tags: [],
    template: '',
    title: ''
};
const preset_ui_libs = {
    react: '17.0.2',
    vue: '2.7.16'
};
const preset_minify_config = {
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
                comments: "some",
                ecma: 2015,
                preserve_annotations: true,
                safari10: true,
                semicolons: false
            },
            mangle: true,
            minify: true
        }
    }
};
const preset_url_config = {
    base: '/',
    cdn: ''
};
const preset_config = {
    analyze: false,
    define: {},
    dev_server: preset_dev_server_config,
    externals: {},
    html: default_html_config,
    input: preset_input_dirs,
    minify: preset_minify_config,
    output: preset_output_dirs,
    ui_lib: preset_ui_libs,
    url: preset_url_config,
    alias: preset_alias
};
const generate_config_root = cwd();
let generate_config_global_config;
function get_global_config(args) {
    if (!generate_config_global_config) {
        const user_config = jsonparse(resolve_and_read(generate_config_root, args.pack.config));
        PANIC_IF(!user_config, "根目录下没有配置文件");
        debug_log("input user config", user_config);
        merge_user_config(preset_config, user_config);
        const _config = preset_config;
        const src = external_node_path_resolve(generate_config_root, _config.input.src);
        const input = {
            modules: external_node_path_resolve(src, _config.input.modules),
            pages: external_node_path_resolve(src, _config.input.pages),
            src: src
        };
        const dist = external_node_path_resolve(generate_config_root, _config.output.dist);
        const output = {
            ..._config.output,
            dist: dist,
            modules: external_node_path_resolve(dist, _config.output.modules),
            pages: external_node_path_resolve(dist, _config.output.pages)
        };
        const html = _config.html?.template ? {
            ..._config.html,
            template: external_node_path_resolve(generate_config_root, _config.html.template)
        } : _config.html;
        const define = Object.fromEntries(Object.entries({
            ..._config.define,
            "process.env.NODE_ENV": process.env.NODE_ENV,
            "import.meta.env.MOUNT_ID": _config.html.root
        }).map(([k, v])=>[
                k,
                JSON.stringify(v)
            ]));
        debug_log("当前模式", process.env.NODE_ENV);
        const minify = true === _config.minify ? preset_minify_config : _config.minify;
        const alias = Object.fromEntries(Object.entries(_config.alias).map(([k, v])=>[
                k,
                v.replace("{input.src}", input.src)
            ]));
        generate_config_global_config = {
            ..._config,
            define,
            html,
            input,
            minify,
            output,
            alias
        };
        debug_log("global config", generate_config_global_config);
    }
    return generate_config_global_config;
}
let config_packagejson = null;
function get_packagejson() {
    if (!config_packagejson) {
        config_packagejson = jsonparse(resolve_and_read(generate_config_root, "package.json"));
        PANIC_IF(!config_packagejson, "根目录下没有package.json");
        PANIC_IF(!config_packagejson.name, "package.json缺少name字段");
    }
    return config_packagejson;
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
    console.log(picocolors.magentaBright(`\n${star_line}修改package.json中的scripts\n新的内容修改后如下:\n${JSON.stringify(new_scripts, null, 2)}\n${star_line}`));
    const rl = node_readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const answer = await new Promise((resolve)=>{
        rl.question("\n确定修改吗？请输入(Y/N) ", (answer)=>{
            rl.close();
            resolve(answer);
        });
    });
    if ("y" !== answer.toLowerCase()) return void console.log("取消修改");
    packagejson.scripts = new_scripts;
    const new_packagejson = JSON.stringify(packagejson, null, 2);
    writeFileSync(external_node_path_resolve(process.cwd(), "package.json"), new_packagejson);
    console.log(picocolors.green(`\npackage.json修改成功`));
}
const vue_example_externals = {
    vue: {
        importName: [
            "vue",
            "Vue"
        ],
        url: {
            umd: "https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js",
            esm: "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm"
        }
    }
};
const react_example_externals = {
    react: {
        importName: [
            "react",
            "React"
        ],
        url: {
            umd: "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js",
            esm: "https://cdn.jsdelivr.net/npm/react@17.0.2/+esm"
        }
    },
    "react-dom": {
        umd: "/packages/common/js/react-17.0.2/umd/react-dom.production.min.js",
        esm: "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/+esm"
    },
    "react/jsx-runtime": {
        umd: "/packages/common/js/react-17.0.2/umd/react-jsx-runtime.js",
        esm: "/packages/common/js/react-17.0.2/esm/react-jsx-runtime.js"
    }
};
const common_example_externals = {
    jquery: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
    rxjs: {
        umd: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/dist/bundles/rxjs.umd.min.js",
        esm: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/+esm"
    }
};
const presets = {
    vue: {
        ...vue_example_externals,
        ...common_example_externals
    },
    react: {
        ...react_example_externals,
        ...common_example_externals
    }
};
function get_example_config(preset) {
    console.log(picocolors.magenta(`\n${star_line}\n默认配置文件中的externals内容为推荐内容\n请注意手动替换配置文件中externals的url，以保证符合项目需求\n如果不需要externals部分依赖，也可以将他们从列表中删除\n${star_line}\n`));
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
        externals: preset ? presets[preset] : common_example_externals
    };
}
const default_config_file_name = "modulo.config.json";
function get_cmd(argv) {
    const cmd_list = [
        "build",
        "dev",
        "init"
    ];
    const cmd = argv._[0];
    PANIC_IF(!cmd_list.includes(cmd), `modulo必须执行 ${cmd_list.join(" 或 ")} 命令`);
    return cmd;
}
const mode_list = [
    "dev",
    "development",
    "prd",
    "production"
];
function get_env(argv, cmd) {
    let env = "";
    if (argv.env) {
        if ("dev" === argv.env || "development" === argv.env) env = "dev";
        else if ("prd" === argv.env || "production" === argv.env) env = "prd";
        else PANIC_IF(true, `env参数只能为 ${mode_list.join(" 或 ")}`);
        console.log(picocolors.blue(`env = ${env}`));
    } else if ("build" === cmd || "dev" === cmd) if (process.env.NODE_ENV) {
        env = "production" === process.env.NODE_ENV ? "prd" : "dev";
        console.log(picocolors.yellow("\n未设置env，将根据process.env.NODE_ENV自动设置\n"), picocolors.yellow(`process.env.NODE_ENV = ${process.env.NODE_ENV}, env = ${env}`));
    } else {
        env = "build" === cmd ? "prd" : "dev";
        console.log(picocolors.yellow("\n未设置env，将根据build或dev命令自动设置\n"), picocolors.yellow(`cmd = ${cmd}, env = ${env}`));
    }
    return env;
}
function set_node_env(mode) {
    const _node_env = 'dev' === mode ? 'development' : 'production';
    if (process.env.NODE_ENV !== _node_env) {
        console.log(picocolors.yellow('\nprocess.env.NODE_ENV 与 mode 不一致, 将被强制设置为与mode匹配的值\n'), picocolors.yellow(`mode = ${mode}, process.env.NODE_ENV = ${_node_env}\n`));
        process.env.NODE_ENV = _node_env;
    }
}
let get_framework_name_framework_name;
function get_framework_name() {
    if (!get_framework_name_framework_name) {
        const { dependencies } = get_packagejson();
        PANIC_IF(!('vue' in dependencies || 'react' in dependencies), 'package.json中未识别到支持的ui库信息, 当前只支持vue和react');
        get_framework_name_framework_name = 'vue' in dependencies ? 'vue' : 'react';
    }
    return get_framework_name_framework_name;
}
function get_preset_for_init(argv) {
    let preset = argv.preset;
    if (!preset) {
        preset = get_framework_name();
        console.log(picocolors.blue("未输入preset，但是根据package.json中的依赖自动识别到preset为: " + preset));
    }
    preset && PANIC_IF("react" !== preset && "vue" !== preset, "目前只支持react和vue");
    return preset;
}
const pack_options = {
    page: "构建页面",
    module: "构建模块",
    all: "页面和模块"
};
const init_options = {
    config: "modulo的配置文件",
    script: "package.json中modulo的启动命令"
};
const target_options = {
    build: pack_options,
    dev: {
        page: pack_options.page,
        module: pack_options.module
    },
    init: init_options
};
function get_cmd_target(argv, cmd) {
    const target = argv._[1];
    const target_list = target_options[cmd];
    PANIC_IF(!(target in target_list), `modulo ${cmd} 命令必须执行 ${Object.entries(target_list).map(([k, v])=>`\n${k} - ${v}`)} 几种目标`);
    return target;
}
let args_args;
const args_argv = minimist(process.argv.slice(2));
const argv_debug = "true" === args_argv.debug;
const argv_verbose = "true" === args_argv.verbose || args_argv.v;
function get_args() {
    if (!args_args) {
        const cmd = get_cmd(args_argv);
        if ("build" === cmd || "dev" === cmd) {
            const target = get_cmd_target(args_argv, cmd);
            const watch = "all" === target ? false : "true" === args_argv.watch || args_argv.w;
            args_args = {
                cmd,
                target,
                pack: {
                    config: args_argv.config || default_config_file_name,
                    env: "build" === cmd || "dev" === cmd ? get_env(args_argv, cmd) : "prd",
                    watch,
                    esm: "esm" === args_argv.format || "esm" === args_argv.f
                }
            };
            args_args.pack.env && set_node_env(args_args.pack.env);
        } else args_args = {
            cmd,
            target: get_cmd_target(args_argv, cmd),
            init: {
                path: args_argv.path,
                force: "true" === args_argv.force || args_argv.f,
                preset: get_preset_for_init(args_argv)
            }
        };
        if (argv_verbose) console.log("args: ", args_args);
    }
    return args_args;
}
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
    writeFileSync(filepath, JSON.stringify(get_example_config(args.init.preset), null, 2));
    console.log(picocolors.green("创建成功"), filepath);
}
function init_tool(args) {
    if ("config" === args.target) create_config_file(args);
    if ("script" === args.target) modify_scripts();
}
function framework_plugin(options) {
    const { dependencies } = get_packagejson();
    const framework_name = get_framework_name();
    const version = dependencies[framework_name];
    const global_config = get_global_config();
    PANIC_IF(global_config.ui_lib[framework_name] !== version, "package.json中只允许使用固定版本号, 并且只支持vue-2.7.16和react-17.0.2");
    return "vue" === framework_name ? pluginVue2(options) : pluginReact(options);
}
function collect_modules(args, kind) {
    const global_config = get_global_config(args);
    const framework_name = get_framework_name();
    const module_path = global_config.input[`${kind}s`];
    const exist = existsSync(module_path);
    debug_log(picocolors.blue("check module_path"), module_path, exist ? "exists" : "NOT exists");
    const module_entries = exist ? readdirSync(module_path, {
        withFileTypes: true
    }).filter((item)=>{
        debug_log("checking module is directory", item.name, item.isDirectory());
        return item.isDirectory();
    }).map((dirent)=>{
        const dir_path = external_node_path_resolve(module_path, dirent.name);
        const entry_file_path = [
            external_node_path_resolve(dir_path, "index.ts"),
            external_node_path_resolve(dir_path, "index.tsx"),
            external_node_path_resolve(dir_path, "index.js"),
            external_node_path_resolve(dir_path, "index.jsx"),
            external_node_path_resolve(dir_path, "main.ts"),
            external_node_path_resolve(dir_path, "main.tsx"),
            external_node_path_resolve(dir_path, "main.js"),
            external_node_path_resolve(dir_path, "main.jsx"),
            ..."vue" === framework_name ? [
                external_node_path_resolve(dir_path, "index.vue"),
                external_node_path_resolve(dir_path, "main.vue"),
                external_node_path_resolve(dir_path, `${dirent.name}.vue`)
            ] : [],
            external_node_path_resolve(dir_path, `${dirent.name}.ts`),
            external_node_path_resolve(dir_path, `${dirent.name}.tsx`),
            external_node_path_resolve(dir_path, `${dirent.name}.js`),
            external_node_path_resolve(dir_path, `${dirent.name}.jsx`)
        ].find((path)=>{
            const exists = existsSync(path);
            debug_log("checking entry candidate", `${path} ${picocolors[exists ? "green" : "red"](`exists - ${exists}`)}`);
            return exists;
        });
        debug_log("found entry", entry_file_path);
        return [
            dirent.name,
            entry_file_path
        ];
    }).filter((entry)=>!!entry[1]) : [];
    return module_entries.length > 0 ? Object.fromEntries(module_entries) : void 0;
}
const root_path = process.cwd();
function omit_root_path(path) {
    return path.replace(root_path, "");
}
function omit_root_path_for_entries(entries) {
    return Object.fromEntries(Object.entries(entries).map(([key, value])=>[
            key,
            omit_root_path(value)
        ]));
}
function guard_is_string(data) {
    return "string" == typeof data;
}
function guard_is_record(data) {
    return !!data && "object" == typeof data;
}
function is_umd_url(data) {
    return guard_is_record(data) && guard_is_string(data.umd);
}
function is_esm_url(data) {
    return guard_is_record(data) && guard_is_string(data.esm);
}
function is_module_typed_external_url(data) {
    return is_umd_url(data) || is_esm_url(data);
}
function is_env_external(data) {
    return guard_is_record(data) && (guard_is_string(data.dev) || is_module_typed_external_url(data.dev)) && (guard_is_string(data.prd) || is_module_typed_external_url(data.prd));
}
function get_external_url(args, url) {
    let _url = url;
    while(!guard_is_string(_url))if (is_env_external(_url)) _url = _url[args.pack.env];
    else {
        const mode = args.pack.esm ? "esm" : "umd";
        _url = mode in _url ? _url[mode] : void 0;
    }
    return _url;
}
function get_externals_importmaps(args, external_list) {
    return Object.entries(external_list).reduce(({ externals, importmaps }, [lib_name, data])=>{
        const _data = is_env_external(data) ? data[args.pack.env] : data;
        const external_lib = "string" == typeof _data ? {
            url: {
                esm: _data,
                umd: _data
            }
        } : is_module_typed_external_url(_data) ? {
            url: _data
        } : _data;
        const _importName = external_lib.importName || lib_name;
        (Array.isArray(_importName) ? _importName : [
            _importName
        ]).forEach((name)=>externals[name] = lib_name);
        const url = get_external_url(args, external_lib.url);
        if (url) importmaps[lib_name] = url;
        return {
            externals,
            importmaps
        };
    }, {
        externals: {},
        importmaps: {}
    });
}
let printed = false;
function prepare_config(args, kind, config) {
    const { externals, importmaps } = get_externals_importmaps(args, config.externals);
    printed || console.log(`${picocolors.blue("\nexternals:")}\n${JSON.stringify(externals, null, 2)}\n`);
    if ("page" === kind) console.log(`${picocolors.blue("html_tags:")}\n${JSON.stringify(config.html.tags, null, 2)}\n`);
    const importmaps_tag = {
        append: false,
        head: true,
        tag: "script",
        attrs: {
            type: args.pack.esm ? "importmap" : "systemjs-importmap"
        },
        children: `{
         "imports": ${JSON.stringify(importmaps, null, 2)}
      }`
    };
    printed || console.log(`${picocolors.blue("\nimportmaps:")}\n${JSON.stringify(importmaps, null, 2)}\n`);
    printed = true;
    console.log(picocolors.blueBright(`\n**** 开始构建 【${kind}】 ****`));
    const entries = collect_modules(args, kind);
    if (entries) console.log(`${picocolors.blue(`\n${kind} entries:`)}\n${JSON.stringify(omit_root_path_for_entries(entries), null, 2)}\n`);
    else console.log(picocolors.red(`\n没有要构建的${kind}，跳过\n`));
    return {
        entries,
        externals,
        importmaps_tag
    };
}
async function lib_pack(args) {
    const config = get_global_config(args);
    const packagejson = get_packagejson();
    const { entries, externals } = prepare_config(args, "module", config);
    if (!entries) return;
    const rslibConfig = defineConfig({
        source: {
            define: config.define,
            entry: entries
        },
        plugins: [
            framework_plugin(),
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
                        css: "css"
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
                        css: "css"
                    },
                    minify: config.minify,
                    injectStyles: true
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
    if ("build" === args.cmd) console.log(picocolors.green("\n**** 构建【module】完成 ****\n"));
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
async function page_pack(args) {
    const config = get_global_config(args);
    const { entries, externals, importmaps_tag } = prepare_config(args, "page", config);
    if (!entries) return;
    const rsbuildConfig = core_defineConfig({
        source: {
            define: config.define,
            entry: entries
        },
        plugins: [
            framework_plugin(),
            pluginLess(),
            pluginUmd({
                name: "modulo-page"
            })
        ],
        tools: {
            rspack: {
                experiments: {
                    outputModule: args.pack.esm
                }
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
            scriptLoading: args.pack.esm ? "module" : "defer",
            tags: [
                importmaps_tag,
                ...config.html.tags
            ],
            template: config.html.template || external_node_path_resolve(get_package_root(), "template/index.html"),
            templateParameters: {
                base_prefix: config.url.base
            },
            title: config.html.title
        },
        resolve: {
            alias: config.alias
        },
        server: {
            base: config.url.base,
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
    const rsbuild = await createRsbuild({
        rsbuildConfig
    });
    await rsbuild["dev" === args.cmd ? "startDevServer" : "build"]({
        watch: "build" === args.cmd && args.pack.watch
    });
    if ("build" === args.cmd) console.log(picocolors.green("\n**** 构建【page】完成 ****"));
}
async function pack_code(args) {
    const { target } = args;
    if ("page" === target || "all" === target) await page_pack(args);
    if ("module" === target || "all" === target) await lib_pack(args);
}
function exec() {
    const args = get_args();
    if ("init" === args.cmd) init_tool(args);
    else if ("build" === args.cmd || "dev" === args.cmd) pack_code(args);
}
export { exec };
