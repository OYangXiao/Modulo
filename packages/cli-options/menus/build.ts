import process from 'node:process';
import { createBuilder } from '@yannick-z/modulo-builder';
import type { CliRuntimeContext, MenuOption } from '@yannick-z/modulo-cli-framework';
import { formatOk } from '@yannick-z/modulo-cli-framework';
import { runDetect } from './detect.ts';

/**
 * build（当前为占位实现）。
 *
 * 约定：构建前先进行 UI 库检测，保证项目依赖满足脚手架支持范围。
 */
export async function runBuild(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'build' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} build 已结束（当前为占位实现）\n`);
}

/**
 * 一级菜单：build
 */
export function createBuildOption(): MenuOption<CliRuntimeContext> {
  return {
    input: '4',
    name: 'build',
    desc: 'build（占位）',
    async func(ctx) {
      await runBuild(ctx.context.cwd);
    },
  };
}
