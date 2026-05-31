import process from 'node:process';
import type { CliRuntimeContext, MenuOption } from '@yannick-z/modulo-cli-framework';
import { formatTitle, hr } from '@yannick-z/modulo-cli-framework';
import { getEnvironmentInfo } from '../mods/node-env.ts';

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

/**
 * 一级菜单：env
 */
export function createEnvOption(): MenuOption<CliRuntimeContext> {
  return {
    input: '2',
    name: 'env',
    desc: '输出环境信息',
    async func() {
      await runEnv();
    },
  };
}
