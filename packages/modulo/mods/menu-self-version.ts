import { readFile } from 'node:fs/promises';

/**
 * 读取当前包（@yannick-z/modulo）的版本号，用于 `--version` 输出。
 */
export async function readSelfPackageVersion(): Promise<string | null> {
  try {
    const pkgPath = new URL('./package.json', import.meta.url);
    const raw = await readFile(pkgPath, 'utf8');
    const json = JSON.parse(raw) as { version?: string };
    return typeof json.version === 'string' ? json.version : null;
  } catch {
    return null;
  }
}
