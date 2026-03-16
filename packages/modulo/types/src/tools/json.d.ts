/**
 * 解析 JSON 字符串
 * @param input JSON 字符串
 * @param defaultValue 解析失败或输入为空时的默认值（可选）
 * @returns 解析后的对象或默认值
 */
export declare function jsonparse<T>(input: string, defaultValue?: T): T | undefined;
/**
 * 更新 JSON 文件
 * @param path 文件路径
 * @param updater 更新函数，接收当前数据并返回新数据
 * @param createIfNotExist 如果文件不存在是否创建（默认 false）
 * @returns 是否更新成功
 */
export declare function update_json_file<T = any>(path: string, updater: (data: T) => T, createIfNotExist?: boolean): boolean;
