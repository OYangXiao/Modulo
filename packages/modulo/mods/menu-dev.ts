import process from 'node:process';
import { createBuilder } from '@yannick-z/modulo-builder';
import { formatOk } from '@yannick-z/modulo-common';
import { runDetect } from './menu-detect.ts';

/**
 * 启动 dev（当前为占位实现）。
 *
 * 约定：启动前先进行 UI 库检测，保证项目依赖满足脚手架支持范围。
 */
export async function runDev(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'dev' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} dev 已结束（当前为占位实现）\n`);
}
