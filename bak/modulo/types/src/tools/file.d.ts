/**
 * 读取文件内容
 * @param path 文件绝对路径
 * @param error_msg 自定义错误消息（可选）
 * @param throwError 是否抛出错误（默认 false）
 * @returns 文件内容字符串，如果失败则返回空字符串（除非 throwError 为 true）
 */
export declare function read_file(path: string, error_msg?: string, throwError?: boolean): string;
/**
 * 解析路径并读取文件
 */
export declare function resolve_and_read(root: string, name: string): string;
/**
 * 获取指定目录下的所有子目录名称
 * @param path 目标目录路径
 * @returns 子目录名称列表
 */
export declare function get_directories(path: string): string[];
/**
 * 在目录中查找入口文件
 * @param dir 目标目录
 * @param candidates 候选文件名（不含扩展名）列表，优先级按顺序
 * @param extensions 支持的扩展名列表，优先级按顺序
 * @returns 找到的入口文件绝对路径，如果未找到返回 undefined
 */
export declare function find_entry_file(dir: string, candidates: string[], extensions?: string[]): string | undefined;
/**
 * 检查文件是否存在
 */
export declare function exists(path: string): boolean;
