import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cwd } from "node:process";
import { args } from "./args";
import { jsonparse } from "./json";
import { common_externals, default_externals } from "./externals";
import { if_then_alert_and_exit } from "./alert-then-exit";

function get_file(path: string, error_msg?: string) {
	try {
		return readFileSync(path, "utf8");
	} catch {
		console.log(error_msg || `文件无法访问或者不存在: ${path}`);
		return "";
	}
}

export const debug_mode = args.debug === "true";

// 命令启动时候的目录作为根目录
export const root_dir = cwd();

const packagejson_path = resolve(root_dir, "package.json");
if (debug_mode) console.log("packagejson_path", packagejson_path);

// 读取package.json
export const packagejson = JSON.parse(get_file(packagejson_path));
if (debug_mode) console.log("packagejson", packagejson);

if_then_alert_and_exit(
	!packagejson.name,
	"必须要在package.json中提供name字段作为工程部署信息",
);

const config_file_path = resolve(root_dir, args.config_file);
if (debug_mode) console.log("config_file_path", config_file_path);

// 读取配置文件
const config_file_content = get_file(
	config_file_path,
	"没有项目配置文件，使用默认设置",
);
if (debug_mode) console.log("config_file_content", config_file_content);

const user_config =
	(config_file_content ? jsonparse(config_file_content) : {}) || {};

export const src_dir = resolve(root_dir, user_config.src_dir || "src");

export const dir_name_config = Object.assign(
	{
		pages: "pages",
		components: "components",
		functions: "functions",
	},
	user_config.dir_names || {},
);
if (debug_mode) console.log("dir_name_config", dir_name_config);

const dist_dir_name = user_config.dist_dir || "dist";
export const dist_dir = resolve(root_dir, dist_dir_name);

// 作为页面时挂载的节点id
export const html_mount_id = user_config.html_mount_id || "app";
export const html_title = user_config.html_title || "新涨乐";

const deps = packagejson.dependencies as { [name: string]: string };
// 该项目是vue还是react项目
const _ui_lib_name =
	"vue" in deps ? "vue" : "react" in deps ? "react" : undefined;
if_then_alert_and_exit(!_ui_lib_name, "package.json中未识别到支持的ui库信息");

// biome-ignore lint/style/noNonNullAssertion: <如果为空会退出程序>
export const ui_lib_name = _ui_lib_name!;

const regex = /(?<=["']?[~^><=]*)(\d+)(?=\.|x|["']|\s|$)/;
const version = deps[ui_lib_name];
const match = version.match(regex);
// ui库的第一个大版本号
export const ui_lib_major_version = match
	? Number.parseInt(match[0], 10)
	: undefined;

export const dev_server_config = Object.assign(
	{
		port: 8080,
		open: undefined,
		proxy: undefined,
	},
	user_config.dev_server || {},
);
export const base_prefix = user_config.base_prefix || "/";
export const base_path =
	user_config.base_path || `${base_prefix}/${packagejson.name}`;
dev_server_config.port = Number.isInteger(dev_server_config.port)
	? dev_server_config.port
	: 8080;
if_then_alert_and_exit(
	!!dev_server_config.open && !Array.isArray(dev_server_config.open),
	"配置文件中dev_server_open必须是字符串数组",
);

export const cdn_domain = user_config.cdn_domain || ''

// 需要external掉的库的配置
export const lib_externals = user_config.lib_externals || {};
if_then_alert_and_exit(
	typeof lib_externals !== "object",
	"配置文件中lib_externals必须是对象",
);

Object.assign(lib_externals, common_externals, default_externals[ui_lib_name]);

if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = args.action === "build" ? "production" : "development";
}

console.log(`\n当前模式: ${process.env.NODE_ENV}\n`);

export const enable_bundle_analyze = user_config.bundle_analyze || false;
console.log(`\n当前是否启用bundle-analyze: ${enable_bundle_analyze}\n`);

export const minify =
	typeof user_config.minify === "boolean"
		? user_config.minify
		: process.env.NODE_ENV === "production" || args.action === "build";

export const define = Object.assign(
	{
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
	user_config.define || {},
);
