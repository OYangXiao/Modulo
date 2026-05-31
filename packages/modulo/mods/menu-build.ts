import process from 'node:process';
import { createBuilder } from '@yannick-z/modulo-builder';
import { formatOk } from '@yannick-z/modulo-common';
import { runDetect } from './menu-detect.ts';

/**
 * 执行 build（当前为占位实现）。
 *
 * 约定：构建前先进行 UI 库检测，保证项目依赖满足脚手架支持范围。
 */
export async function runBuild(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'build' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} build 已结束（当前为占位实现）\n`);
}
