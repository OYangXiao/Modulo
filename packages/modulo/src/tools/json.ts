import picocolors from 'picocolors';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * 解析 JSON 字符串
 * @param input JSON 字符串
 * @param defaultValue 解析失败或输入为空时的默认值（可选）
 * @returns 解析后的对象或默认值
 */
export function jsonparse<T>(input: string, defaultValue?: T): T | undefined {
  try {
    if (input) {
      return JSON.parse(input) as T;
    }
    return defaultValue;
  } catch (e) {
    console.error(picocolors.red(`JSON.parse failed\n${e}`));
    return defaultValue;
  }
}

/**
 * 更新 JSON 文件
 * @param path 文件路径
 * @param updater 更新函数，接收当前数据并返回新数据
 * @param createIfNotExist 如果文件不存在是否创建（默认 false）
 * @returns 是否更新成功
 */
export function update_json_file<T = any>(
  path: string, 
  updater: (data: T) => T,
  createIfNotExist = false
): boolean {
  try {
    let data: T;
    try {
      const content = readFileSync(path, 'utf-8');
      const parsed = jsonparse<T>(content);
      if (!parsed) {
        if (createIfNotExist) {
          data = {} as T;
        } else {
          console.error(picocolors.red(`Failed to parse JSON file: ${path}`));
          return false;
        }
      } else {
        data = parsed;
      }
    } catch (error: any) {
      if (error.code === 'ENOENT' && createIfNotExist) {
        data = {} as T;
      } else {
        console.error(picocolors.red(`Failed to read file: ${path}`));
        return false;
      }
    }

    const newData = updater(data);
    writeFileSync(path, JSON.stringify(newData, null, 2) + '\n');
    return true;
  } catch (e) {
    console.error(picocolors.red(`Failed to update JSON file: ${path}\n${e}`));
    return false;
  }
}
