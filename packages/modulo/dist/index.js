import * as __WEBPACK_EXTERNAL_MODULE_node_fs_5ea92f0c__ from "node:fs";
import * as __WEBPACK_EXTERNAL_MODULE_node_path_c5b9b54f__ from "node:path";
import * as __WEBPACK_EXTERNAL_MODULE_node_process_786449bf__ from "node:process";
import * as __WEBPACK_EXTERNAL_MODULE_node_readline_91c31510__ from "node:readline";
import * as __WEBPACK_EXTERNAL_MODULE_picocolors__ from "picocolors";
import * as __WEBPACK_EXTERNAL_MODULE_cac__ from "cac";
import * as __WEBPACK_EXTERNAL_MODULE_node_module_ab9f2194__ from "node:module";
var __webpack_modules__ = {
    "./src/config/example/example-config.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            C: ()=>default_config_file_name,
            T: ()=>get_example_config
        });
        var external_picocolors_ = __webpack_require__("picocolors");
        var modify_scripts = __webpack_require__("./src/initiator/modify-scripts.ts");
        var presets = __webpack_require__("./src/config/presets.ts");
        const vue2_example_externals = {
            vue: {
                importName: [
                    "vue",
                    "Vue"
                ],
                url: "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm"
            }
        };
        const react17_example_externals = {
            react: {
                importName: [
                    "react",
                    "React"
                ],
                url: "https://cdn.jsdelivr.net/npm/react@17.0.2/+esm"
            },
            "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/+esm",
            "react/jsx-runtime": "/packages/common/js/react-17.0.2/esm/react-jsx-runtime.js"
        };
        const react19_example_externals = {
            react: {
                importName: [
                    "react",
                    "React"
                ],
                url: "https://esm.sh/react@19.0.0"
            },
            "react-dom": "https://esm.sh/react-dom@19.0.0",
            "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime"
        };
        const common_example_externals = {
            jquery: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
            rxjs: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/+esm"
        };
        const example_externals_presets = {
            vue2: {
                ...vue2_example_externals,
                ...common_example_externals
            },
            react17: {
                ...react17_example_externals,
                ...common_example_externals
            },
            react19: {
                ...react19_example_externals,
                ...common_example_externals
            }
        };
        function get_example_config(preset) {
            console.log(external_picocolors_["default"].magenta(`\n${modify_scripts.q}\n默认配置文件中的externals内容为推荐内容\n请注意手动替换配置文件中externals的url，以保证符合项目需求\n如果不需要externals部分依赖，也可以将他们从列表中删除\n${modify_scripts.q}\n`));
            let externals = common_example_externals;
            if (preset) {
                if ("react" === preset) externals = example_externals_presets.react17;
                else if ("react19" === preset) externals = example_externals_presets.react19;
                else if ("vue" === preset || "vue2" === preset) externals = example_externals_presets.vue2;
            }
            return {
                input: presets.pw.input,
                output: {
                    filenameHash: true
                },
                url: {
                    base: "/"
                },
                alias: presets.rH,
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
                    proxy: presets.pw.dev_server.proxy
                },
                externals
            };
        }
        const default_config_file_name = "modulo.config.json";
    },
    "./src/config/index.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            eP: ()=>get_global_config,
            mJ: ()=>get_packagejson
        });
        var external_node_path_ = __webpack_require__("node:path");
        var external_node_process_ = __webpack_require__("node:process");
        var debug_log = __webpack_require__("./src/tools/debug-log.ts");
        var file = __webpack_require__("./src/tools/file.ts");
        var json = __webpack_require__("./src/tools/json.ts");
        var panic = __webpack_require__("./src/tools/panic.ts");
        function merge_user_config(target, input) {
            for(const key in input){
                const from = input[key];
                const to = target[key];
                if (typeof from === typeof to && key in target) if (Array.isArray(to)) {
                    (0, panic.a)(!Array.isArray(from));
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
        var presets = __webpack_require__("./src/config/presets.ts");
        const root = (0, external_node_process_.cwd)();
        let packagejson = null;
        function get_packagejson() {
            if (!packagejson) {
                packagejson = (0, json.a)((0, file.Cr)(root, "package.json"));
                (0, panic.a)(!packagejson, "根目录下没有package.json");
                (0, panic.a)(!packagejson.name, "package.json缺少name字段");
            }
            return packagejson;
        }
        let global_config;
        function get_global_config(args) {
            if (!global_config) {
                const user_config = (0, json.a)((0, file.Cr)(root, args.pack.config));
                (0, panic.a)(!user_config, "根目录下没有配置文件");
                (0, debug_log.n)("input user config", user_config);
                if (user_config.extends) {
                    const require = (0, __WEBPACK_EXTERNAL_MODULE_node_module_ab9f2194__.createRequire)(import.meta.url);
                    const extend_config_path = require.resolve(user_config.extends, {
                        paths: [
                            root
                        ]
                    });
                    const extend_config = require(extend_config_path);
                    (0, debug_log.n)("extend config", extend_config);
                    merge_user_config(presets.pw, extend_config);
                }
                merge_user_config(presets.pw, user_config);
                const _config = presets.pw;
                const src = (0, external_node_path_.resolve)(root, _config.input.src);
                const input = {
                    modules: (0, external_node_path_.resolve)(src, _config.input.modules),
                    pages: (0, external_node_path_.resolve)(src, _config.input.pages),
                    src: src
                };
                const dist = (0, external_node_path_.resolve)(root, _config.output.dist);
                const output = {
                    ..._config.output,
                    dist: dist,
                    modules: (0, external_node_path_.resolve)(dist, _config.output.modules),
                    pages: (0, external_node_path_.resolve)(dist, _config.output.pages)
                };
                const html = _config.html?.template ? {
                    ..._config.html,
                    template: (0, external_node_path_.resolve)(root, _config.html.template)
                } : _config.html;
                const define = Object.fromEntries(Object.entries({
                    ..._config.define,
                    "import.meta.env.MOUNT_ID": _config.html.root
                }).map(([k, v])=>[
                        k,
                        JSON.stringify(v)
                    ]));
                (0, debug_log.n)("当前模式", process.env.NODE_ENV);
                const minify = true === _config.minify ? presets.Cw : _config.minify;
                const alias = Object.fromEntries(Object.entries(_config.alias).map(([k, v])=>[
                        k,
                        v.replace("{input.src}", input.src)
                    ]));
                global_config = {
                    ..._config,
                    define,
                    html,
                    input,
                    minify,
                    output,
                    alias
                };
                (0, debug_log.n)("global config", global_config);
            }
            return global_config;
        }
    },
    "./src/config/presets.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            Cw: ()=>preset_minify_config,
            pw: ()=>preset_config,
            rH: ()=>preset_alias
        });
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
            react19: '19.0.0',
            vue: '2.7.16',
            vue2: '2.7.16'
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
            alias: preset_alias,
            webhost: true,
            autoExternal: true,
            externalsType: "importmap"
        };
    },
    "./src/initiator/modify-scripts.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            q: ()=>star_line,
            o: ()=>modify_scripts
        });
        var external_node_path_ = __webpack_require__("node:path");
        var external_picocolors_ = __webpack_require__("picocolors");
        var config = __webpack_require__("./src/config/index.ts");
        var external_node_readline_ = __webpack_require__("node:readline");
        async function cli_confirm(message) {
            const rl = external_node_readline_["default"].createInterface({
                input: process.stdin,
                output: process.stdout
            });
            return new Promise((resolve)=>{
                rl.question(`${external_picocolors_["default"].yellow(message)} (Y/n) `, (answer)=>{
                    rl.close();
                    resolve("y" === answer.toLowerCase() || "" === answer);
                });
            });
        }
        var json = __webpack_require__("./src/tools/json.ts");
        const star_line = "**********************";
        async function modify_scripts() {
            const packagejson = (0, config.mJ)();
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
            console.log(external_picocolors_["default"].magentaBright(`\n${star_line}修改package.json中的scripts\n新的内容修改后如下:\n${JSON.stringify(new_scripts, null, 2)}\n${star_line}`));
            const confirmed = await cli_confirm("\n确定修改吗？");
            if (!confirmed) return void console.log("取消修改");
            const success = (0, json.Q)((0, external_node_path_.resolve)(process.cwd(), "package.json"), (data)=>{
                data.scripts = new_scripts;
                return data;
            });
            if (success) console.log(external_picocolors_["default"].green(`\npackage.json修改成功`));
            else console.log(external_picocolors_["default"].red(`\npackage.json修改失败`));
        }
    },
    "./src/tools/debug-log.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            n: ()=>debug_log
        });
        var node_fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("node:fs");
        var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("node:path");
        var picocolors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("picocolors");
        const logFile = node_path__WEBPACK_IMPORTED_MODULE_1__.join(process.cwd(), "modulo.debug.log");
        let index = 0;
        function debug_log(hint, ...params) {
            const argv_debug = process.env.DEBUG || process.argv.includes("--debug");
            const argv_verbose = process.argv.includes("--verbose") || process.argv.includes("-v");
            if (!argv_debug && !argv_verbose) return;
            const timestamp = new Date().toISOString();
            const sn = String(index++).padStart(3, "0");
            const logEntry = `--------------\n${sn} [${timestamp}] ${hint}\n${params.map((p)=>"object" == typeof p ? JSON.stringify(p, null, 2) : String(p)).join("\n")}\n---------------\n\n`;
            if (argv_verbose) console.log(logEntry);
            if (argv_debug) {
                console.log(picocolors__WEBPACK_IMPORTED_MODULE_2__["default"].blue(`\ndebug log ${sn}`));
                node_fs__WEBPACK_IMPORTED_MODULE_0__.appendFileSync(logFile, logEntry);
            }
        }
    },
    "./src/tools/file.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            Cr: ()=>resolve_and_read,
            Ke: ()=>find_entry_file,
            t2: ()=>exists,
            xh: ()=>get_directories
        });
        var node_fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("node:fs");
        var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("node:path");
        var picocolors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("picocolors");
        var _debug_log_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/tools/debug-log.ts");
        function read_file(path, error_msg, throwError = false) {
            try {
                return (0, node_fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(path, 'utf8');
            } catch (error) {
                const msg = error_msg || `文件无法访问或者不存在: ${path}`;
                (0, _debug_log_ts__WEBPACK_IMPORTED_MODULE_3__.n)('read_file error', msg, error);
                if (throwError) throw new Error(msg);
                console.log(picocolors__WEBPACK_IMPORTED_MODULE_2__["default"].red(msg));
                return '';
            }
        }
        function resolve_and_read(root, name) {
            const fullpath = (0, node_path__WEBPACK_IMPORTED_MODULE_1__.resolve)(root, name);
            (0, _debug_log_ts__WEBPACK_IMPORTED_MODULE_3__.n)(`resolve file: ${name}`, 'result is:', fullpath);
            return read_file(fullpath);
        }
        function get_directories(path) {
            try {
                if (!(0, node_fs__WEBPACK_IMPORTED_MODULE_0__.existsSync)(path)) return [];
                return (0, node_fs__WEBPACK_IMPORTED_MODULE_0__.readdirSync)(path).filter((file)=>{
                    const fullPath = (0, node_path__WEBPACK_IMPORTED_MODULE_1__.join)(path, file);
                    return (0, node_fs__WEBPACK_IMPORTED_MODULE_0__.statSync)(fullPath).isDirectory();
                });
            } catch (error) {
                (0, _debug_log_ts__WEBPACK_IMPORTED_MODULE_3__.n)('get_directories error', path, error);
                return [];
            }
        }
        function find_entry_file(dir, candidates, extensions = [
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.vue'
        ]) {
            for (const name of candidates)for (const ext of extensions){
                const filename = `${name}${ext}`;
                const filepath = (0, node_path__WEBPACK_IMPORTED_MODULE_1__.join)(dir, filename);
                if ((0, node_fs__WEBPACK_IMPORTED_MODULE_0__.existsSync)(filepath) && (0, node_fs__WEBPACK_IMPORTED_MODULE_0__.statSync)(filepath).isFile()) return filepath;
            }
        }
        function exists(path) {
            const isExist = (0, node_fs__WEBPACK_IMPORTED_MODULE_0__.existsSync)(path);
            (0, _debug_log_ts__WEBPACK_IMPORTED_MODULE_3__.n)(`check exists: ${path}`, isExist);
            return isExist;
        }
    },
    "./src/tools/json.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            Q: ()=>update_json_file,
            a: ()=>jsonparse
        });
        var picocolors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("picocolors");
        var node_fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("node:fs");
        function jsonparse(input, defaultValue) {
            try {
                if (input) return JSON.parse(input);
                return defaultValue;
            } catch (e) {
                console.error(picocolors__WEBPACK_IMPORTED_MODULE_0__["default"].red(`JSON.parse failed\n${e}`));
                return defaultValue;
            }
        }
        function update_json_file(path, updater, createIfNotExist = false) {
            try {
                let data;
                try {
                    const content = (0, node_fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync)(path, 'utf-8');
                    const parsed = jsonparse(content);
                    if (parsed) data = parsed;
                    else if (createIfNotExist) data = {};
                    else {
                        console.error(picocolors__WEBPACK_IMPORTED_MODULE_0__["default"].red(`Failed to parse JSON file: ${path}`));
                        return false;
                    }
                } catch (error) {
                    if ('ENOENT' === error.code && createIfNotExist) data = {};
                    else {
                        console.error(picocolors__WEBPACK_IMPORTED_MODULE_0__["default"].red(`Failed to read file: ${path}`));
                        return false;
                    }
                }
                const newData = updater(data);
                (0, node_fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync)(path, JSON.stringify(newData, null, 2) + '\n');
                return true;
            } catch (e) {
                console.error(picocolors__WEBPACK_IMPORTED_MODULE_0__["default"].red(`Failed to update JSON file: ${path}\n${e}`));
                return false;
            }
        }
    },
    "./src/tools/panic.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.d(__webpack_exports__, {
            a: ()=>PANIC_IF
        });
        var node_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("node:process");
        var picocolors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("picocolors");
        const alert = '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !';
        function PANIC_IF(status = false, msg = "SOMETHING'S WRONG", halt = true) {
            if (status) {
                console.log(picocolors__WEBPACK_IMPORTED_MODULE_1__["default"].bgRed(picocolors__WEBPACK_IMPORTED_MODULE_1__["default"].white(`\n${alert}\n\n${msg}\n\n${alert}`)), '\n');
                halt && (0, node_process__WEBPACK_IMPORTED_MODULE_0__.exit)(1);
            }
        }
    },
    "node:fs": function(module) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_node_fs_5ea92f0c__;
    },
    "node:path": function(module) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_node_path_c5b9b54f__;
    },
    "node:process": function(module) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_node_process_786449bf__;
    },
    "node:readline": function(module) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_node_readline_91c31510__;
    },
    picocolors: function(module) {
        module.exports = __WEBPACK_EXTERNAL_MODULE_picocolors__;
    }
};
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}
__webpack_require__.m = __webpack_modules__;
(()=>{
    __webpack_require__.d = (exports, definition)=>{
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
(()=>{
    __webpack_require__.f = {};
    __webpack_require__.e = (chunkId)=>Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key)=>{
            __webpack_require__.f[key](chunkId, promises);
            return promises;
        }, []));
})();
(()=>{
    __webpack_require__.u = (chunkId)=>"" + chunkId + ".js";
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports)=>{
        if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports, '__esModule', {
            value: true
        });
    };
})();
(()=>{
    var installedChunks = {
        410: 0
    };
    var installChunk = (data)=>{
        var __webpack_ids__ = data.__webpack_ids__;
        var __webpack_modules__ = data.__webpack_modules__;
        var __webpack_runtime__ = data.__webpack_runtime__;
        var moduleId, chunkId, i = 0;
        for(moduleId in __webpack_modules__)if (__webpack_require__.o(__webpack_modules__, moduleId)) __webpack_require__.m[moduleId] = __webpack_modules__[moduleId];
        if (__webpack_runtime__) __webpack_runtime__(__webpack_require__);
        for(; i < __webpack_ids__.length; i++){
            chunkId = __webpack_ids__[i];
            if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) installedChunks[chunkId][0]();
            installedChunks[__webpack_ids__[i]] = 0;
        }
    };
    __webpack_require__.f.j = function(chunkId, promises) {
        var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : void 0;
        if (0 !== installedChunkData) if (installedChunkData) promises.push(installedChunkData[1]);
        else {
            var promise = import("./" + __webpack_require__.u(chunkId)).then(installChunk, (e)=>{
                if (0 !== installedChunks[chunkId]) installedChunks[chunkId] = void 0;
                throw e;
            });
            var promise = Promise.race([
                promise,
                new Promise((resolve)=>{
                    installedChunkData = installedChunks[chunkId] = [
                        resolve
                    ];
                })
            ]);
            promises.push(installedChunkData[1] = promise);
        }
    };
})();
var external_picocolors_ = __webpack_require__("picocolors");
var example_config = __webpack_require__("./src/config/example/example-config.ts");
const logger = {
    info: (msg)=>console.log(external_picocolors_["default"].cyan(msg)),
    success: (msg)=>console.log(external_picocolors_["default"].green(msg)),
    warn: (msg)=>console.log(external_picocolors_["default"].yellow(msg)),
    error: (msg)=>console.log(external_picocolors_["default"].red(msg)),
    debug: (msg)=>{
        if (process.env.DEBUG) console.log(external_picocolors_["default"].gray(`[DEBUG] ${msg}`));
    }
};
const cli = (0, __WEBPACK_EXTERNAL_MODULE_cac__.cac)("modulo");
cli.command("init <target>", "Initialize modulo configuration or scripts").option("-f, --force", "Force overwrite existing files").option("--path <path>", "Specify the path to initialize").option("--preset <preset>", "Specify the preset to use").action((target, options)=>{
    __webpack_require__.e("287").then(__webpack_require__.bind(__webpack_require__, "./src/cli/init.ts")).then(({ init_tool })=>{
        init_tool({
            cmd: "init",
            target: target,
            init: {
                path: options.path,
                force: options.force,
                preset: options.preset
            }
        });
    });
});
cli.command("build <target>", "Build the project for production").option("-c, --config <file>", "Use specified config file").option("-w, --watch", "Watch for changes").option("--env <env>", "Specify the environment (dev/prd)").action((target, options)=>{
    __webpack_require__.e("897").then(__webpack_require__.bind(__webpack_require__, "./src/cli/pack-code.ts")).then(({ pack_code })=>{
        pack_code({
            cmd: "build",
            target: target,
            pack: {
                config: options.config || example_config.C,
                env: options.env || "prd",
                watch: options.watch,
                esm: true
            }
        });
    });
});
cli.command("dev <target>", "Start development server").option("-c, --config <file>", "Use specified config file").option("--env <env>", "Specify the environment (dev/prd)").option("--debug", "Enable debug mode").action((target, options)=>{
    if (options.debug) process.env.DEBUG = "true";
    __webpack_require__.e("897").then(__webpack_require__.bind(__webpack_require__, "./src/cli/pack-code.ts")).then(({ pack_code })=>{
        pack_code({
            cmd: "dev",
            target: target,
            pack: {
                config: options.config || example_config.C,
                env: options.env || "dev",
                watch: true,
                esm: true
            }
        });
    });
});
cli.command("preview <target>", "Preview the production build").option("-c, --config <file>", "Use specified config file").action((target, options)=>{
    __webpack_require__.e("897").then(__webpack_require__.bind(__webpack_require__, "./src/cli/pack-code.ts")).then(({ pack_code })=>{
        pack_code({
            cmd: "preview",
            target: target,
            pack: {
                config: options.config || example_config.C,
                env: "prd",
                watch: false,
                esm: true
            }
        });
    });
});
cli.help();
cli.version("0.2.0");
function exec() {
    try {
        cli.parse();
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        cli.outputHelp();
        process.exit(1);
    }
}
export { exec, logger };
