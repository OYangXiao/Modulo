import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * 判断文件是否存在。
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取并解析 JSON 文件。
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

/**
 * 从 startCwd 向上查找最近的指定文件，并返回其绝对路径。
 *
 * 常用于在子目录（例如 packages/foo 或 src）中执行命令时，仍能定位到项目根或包根文件。
 */
export async function findNearestFileUp(startCwd: string, fileName: string): Promise<string> {
  let current = path.resolve(startCwd);
  while (true) {
    const candidate = path.join(current, fileName);
    if (await fileExists(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`未找到 ${fileName}（从 ${startCwd} 向上查找失败）`);
}
