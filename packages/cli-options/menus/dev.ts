import process from 'node:process';
import { createBuilder } from '@yannick-z/modulo-builder';
import type { CliRuntimeContext, MenuOption } from '@yannick-z/modulo-cli-framework';
import { formatOk } from '@yannick-z/modulo-cli-framework';
import { runDetect } from './detect.ts';

/**
 * dev（当前为占位实现）。
 *
 * 约定：启动前先进行 UI 库检测，保证项目依赖满足脚手架支持范围。
 */
export async function runDev(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'dev' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} dev 已结束（当前为占位实现）\n`);
}

/**
 * 一级菜单：dev
 */
export function createDevOption(): MenuOption<CliRuntimeContext> {
  return {
    input: '3',
    name: 'dev',
    desc: 'dev（占位）',
    async func(ctx) {
      await runDev(ctx.context.cwd);
    },
  };
}
