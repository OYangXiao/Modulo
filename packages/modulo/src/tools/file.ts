import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import picocolors from 'picocolors';
import { debug_log } from './debug-log.ts';

export function read_file(path: string, error_msg?: string) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    console.log(picocolors.red(error_msg || `文件无法访问或者不存在: ${path}`));
    return '';
  }
}

export function resolve_and_read(root: string, name: string) {
  const fullpath = resolve(root, name);
  debug_log(`resolve file: ${name}`, 'result is:', fullpath);
  return read_file(fullpath);
}
