import process from 'node:process';
import { formatTitle, hr } from '@yannick-z/modulo-common';
import { getEnvironmentInfo } from '@yannick-z/modulo-helper';

/**
 * 输出环境信息。
 */
export async function runEnv(): Promise<void> {
  const info = getEnvironmentInfo();
  process.stdout.write(`${formatTitle('环境信息')}\n${hr()}\n`);
  process.stdout.write(`- node: ${info.nodeVersion}\n`);
  process.stdout.write(`- platform: ${info.platform}\n`);
  process.stdout.write(`- arch: ${info.arch}\n`);
}
