import process from 'node:process';
import type { CliRuntimeContext, MenuOption } from '@yannick-z/modulo-cli-framework';
import { formatWarn } from '@yannick-z/modulo-cli-framework';

/**
 * init（当前为占位实现）。
 */
export async function runInit(): Promise<void> {
  process.stdout.write(`${formatWarn('WARN')} init 暂未实现\n`);
}

/**
 * 一级菜单：init
 */
export function createInitOption(): MenuOption<CliRuntimeContext> {
  return {
    input: '5',
    name: 'init',
    desc: 'init（占位）',
    async func() {
      await runInit();
    },
  };
}
