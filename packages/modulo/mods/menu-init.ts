import process from 'node:process';
import { formatWarn } from '@yannick-z/modulo-common';

/**
 * 初始化项目（当前为占位实现）。
 */
export async function runInit(): Promise<void> {
  process.stdout.write(`${formatWarn('WARN')} init 暂未实现\n`);
}
