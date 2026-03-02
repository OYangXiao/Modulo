import { relative } from "node:path";

/**
 * 获取相对于根目录的路径
 * @param path 绝对路径
 * @returns 相对路径（以 / 开头）
 */
export function omit_root_path(path: string): string {
	const rel = relative(process.cwd(), path);
	// 保持输出格式一致，添加前导 /
	return rel.startsWith("/") ? rel : `/${rel}`;
}

/**
 * 批量处理入口文件路径
 */
export function omit_root_path_for_entries(entries: Record<string, string>) {
	return Object.fromEntries(
		Object.entries(entries).map(([key, value]) => [key, omit_root_path(value)]),
	);
}
