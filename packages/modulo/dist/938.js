import { cwd, exit } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { debug_log, readFileSync, readdirSync, resolve, existsSync, statSync, picocolors, writeFileSync, join } from "./131.js";
function read_file(path, error_msg, throwError = false) {
    try {
        return readFileSync(path, "utf8");
    } catch (error) {
        const msg = error_msg || `文件无法访问或者不存在: ${path}`;
        debug_log("read_file error", msg, error);
        if (throwError) throw new Error(msg);
        console.log(picocolors.red(msg));
        return "";
    }
}
function resolve_and_read(root, name) {
    const fullpath = resolve(root, name);
    debug_log(`resolve file: ${name}`, "result is:", fullpath);
    return read_file(fullpath);
}
function get_directories(path) {
    try {
        if (!existsSync(path)) return [];
        return readdirSync(path).filter((file)=>{
            const fullPath = join(path, file);
            return statSync(fullPath).isDirectory();
        });
    } catch (error) {
        debug_log("get_directories error", path, error);
        return [];
    }
}
function find_entry_file(dir, candidates, extensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".vue"
]) {
    for (const name of candidates)for (const ext of extensions){
        const filename = `${name}${ext}`;
        const filepath = join(dir, filename);
        if (existsSync(filepath) && statSync(filepath).isFile()) return filepath;
    }
}
function exists(path) {
    const isExist = existsSync(path);
    debug_log(`check exists: ${path}`, isExist);
    return isExist;
}
function jsonparse(input, defaultValue) {
    try {
        if (input) return JSON.parse(input);
        return defaultValue;
    } catch (e) {
        console.error(picocolors.red(`JSON.parse failed\n${e}`));
        return defaultValue;
    }
}
function update_json_file(path, updater, createIfNotExist = false) {
    try {
        let data;
        try {
            const content = readFileSync(path, "utf-8");
            const parsed = jsonparse(content);
            if (parsed) data = parsed;
            else if (createIfNotExist) data = {};
            else {
                console.error(picocolors.red(`Failed to parse JSON file: ${path}`));
                return false;
            }
        } catch (error) {
            if ("ENOENT" === error.code && createIfNotExist) data = {};
            else {
                console.error(picocolors.red(`Failed to read file: ${path}`));
                return false;
            }
        }
        const newData = updater(data);
        writeFileSync(path, JSON.stringify(newData, null, 2) + "\n");
        return true;
    } catch (e) {
        console.error(picocolors.red(`Failed to update JSON file: ${path}\n${e}`));
        return false;
    }
}
const panic_alert = "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !";
function PANIC_IF(status = false, msg = "SOMETHING'S WRONG", halt = true) {
    if (status) {
        console.log(picocolors.bgRed(picocolors.white(`\n${panic_alert}\n\n${msg}\n\n${panic_alert}`)), "\n");
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
    distPath: "dist",
    pages: "",
    modules: "modules",
    filenameHash: true
};
const default_html_config = {
    meta: {},
    root: "",
    tags: [],
    template: "",
    title: ""
};
const preset_ui_libs = {
    react19: "19.2.4",
    vue2: "2.7.16"
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
    base: "/",
    cdn: ""
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
const config_root = cwd();
let packagejson = null;
function get_packagejson(customRoot = config_root) {
    if (packagejson) {
        if (customRoot !== config_root) {
            const newPackageJson = jsonparse(resolve_and_read(customRoot, "package.json"));
            PANIC_IF(!newPackageJson, "根目录下没有package.json");
            PANIC_IF(!newPackageJson.name, "package.json缺少name字段");
            return newPackageJson;
        }
    } else {
        packagejson = jsonparse(resolve_and_read(customRoot, "package.json"));
        PANIC_IF(!packagejson, "根目录下没有package.json");
        PANIC_IF(!packagejson.name, "package.json缺少name字段");
    }
    return packagejson;
}
let global_config;
async function get_global_config(args) {
    if (!global_config) {
        let configPath = args.pack.config;
        if (!configPath) {
            const candidates = [
                "modulo.config.ts",
                "modulo.config.js",
                "modulo.config.json"
            ];
            for (const f of candidates){
                const p = resolve(config_root, f);
                if (existsSync(p)) {
                    configPath = p;
                    break;
                }
            }
        }
        if (!configPath) throw new Error("根目录下没有配置文件 (modulo.config.ts/js/json)");
        const resolvedConfigPath = resolve(config_root, configPath);
        let user_config;
        try {
            const fileUrl = pathToFileURL(resolvedConfigPath).href;
            const mod = await import(fileUrl);
            user_config = mod.default || mod;
        } catch (e) {
            console.error(`无法加载配置文件: ${resolvedConfigPath}`);
            throw e;
        }
        PANIC_IF(!user_config, "根目录下没有配置文件");
        debug_log("input user config", user_config);
        if (user_config.extends) {
            const extend_config_path = resolve(config_root, user_config.extends);
            try {
                const extend_fileUrl = pathToFileURL(extend_config_path).href;
                const extend_mod = await import(extend_fileUrl);
                const extend_config = extend_mod.default || extend_mod;
                debug_log("extend config", extend_config);
                merge_user_config(preset_config, extend_config);
            } catch (e) {
                console.error(`无法加载继承的配置文件: ${extend_config_path}`);
                throw e;
            }
        }
        merge_user_config(preset_config, user_config);
        const _config = preset_config;
        const src = resolve(config_root, _config.input.src);
        const input = {
            modules: resolve(src, _config.input.modules),
            pages: resolve(src, _config.input.pages),
            src: src
        };
        const dist = resolve(config_root, _config.output.distPath);
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
        const define = Object.fromEntries(Object.entries({
            ..._config.define,
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
        global_config = {
            ..._config,
            define,
            html,
            input,
            minify,
            output,
            alias
        };
        debug_log("global config", global_config);
    }
    return global_config;
}
export { PANIC_IF, exists, fileURLToPath, find_entry_file, get_directories, get_global_config, get_packagejson, pathToFileURL, preset_alias, preset_config, update_json_file };
