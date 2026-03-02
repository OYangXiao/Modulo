import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import picocolors from "picocolors";
import { debug_log } from "./log.ts";

/**
 * 读取文件内容
 * @param path 文件绝对路径
 * @param error_msg 自定义错误消息（可选）
 * @param throwError 是否抛出错误（默认 false）
 * @returns 文件内容字符串，如果失败则返回空字符串（除非 throwError 为 true）
 */
export function read_file(
	path: string,
	error_msg?: string,
	throwError = false,
) {
	try {
		return readFileSync(path, "utf8");
	} catch (error) {
		const msg = error_msg || `文件无法访问或者不存在: ${path}`;
		debug_log("read_file error", msg, error);
		if (throwError) {
			throw new Error(msg);
		}
		console.log(picocolors.red(msg));
		return "";
	}
}

/**
 * 解析路径并读取文件
 */
export function resolve_and_read(root: string, name: string) {
	const fullpath = resolve(root, name);
	debug_log(`resolve file: ${name}`, "result is:", fullpath);
	return read_file(fullpath);
}

/**
 * 获取指定目录下的所有子目录名称
 * @param path 目标目录路径
 * @returns 子目录名称列表
 */
export function get_directories(path: string): string[] {
	try {
		if (!existsSync(path)) return [];
		return readdirSync(path).filter((file) => {
			const fullPath = join(path, file);
			return statSync(fullPath).isDirectory();
		});
	} catch (error) {
		debug_log("get_directories error", path, error);
		return [];
	}
}

/**
 * 在目录中查找入口文件
 * @param dir 目标目录
 * @param candidates 候选文件名（不含扩展名）列表，优先级按顺序
 * @param extensions 支持的扩展名列表，优先级按顺序
 * @returns 找到的入口文件绝对路径，如果未找到返回 undefined
 */
export function find_entry_file(
	dir: string,
	candidates: string[],
	extensions: string[] = [".ts", ".tsx", ".js", ".jsx", ".vue"],
): string | undefined {
	for (const name of candidates) {
		for (const ext of extensions) {
			const filename = `${name}${ext}`;
			const filepath = join(dir, filename);
			if (existsSync(filepath) && statSync(filepath).isFile()) {
				return filepath;
			}
		}
	}
	return undefined;
}

/**
 * 检查文件是否存在
 */
export function exists(path: string): boolean {
	const isExist = existsSync(path);
	debug_log(`check exists: ${path}`, isExist);
	return isExist;
}
