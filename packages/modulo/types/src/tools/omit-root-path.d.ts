/**
 * 获取相对于根目录的路径
 * @param path 绝对路径
 * @returns 相对路径（以 / 开头）
 */
export declare function omit_root_path(path: string): string;
/**
 * 批量处理入口文件路径
 */
export declare function omit_root_path_for_entries(entries: Record<string, {
    entry_dir: string;
    entry: string;
}>): {
    [k: string]: {
        entry_dir: string;
        entry: string;
    };
};
