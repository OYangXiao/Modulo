import process from 'node:process';
import type { CliRuntimeContext, MenuOption } from '@yannick-z/modulo-cli-framework';
import { formatOk } from '@yannick-z/modulo-cli-framework';
import { detectUiLibraries } from '../mods/ui-library.ts';

/**
 * 执行 UI 库检测并输出报告。
 */
export async function runDetect(cwd: string): Promise<void> {
  const report = await detectUiLibraries(cwd);

  process.stdout.write(`${formatOk('OK')} 已检测到 UI 库：${report.supported.join(', ')}\n`);

  if (report.vue) {
    process.stdout.write(`- vue (${report.vue.kind}): ${report.vue.installedVersion}\n`);
  }
  if (report.react) {
    process.stdout.write(`- react: ${report.react.installedVersion}\n`);
  }
  if (report.lit) {
    process.stdout.write(`- lit: ${report.lit.installedVersion}\n`);
  }
}

/**
 * 一级菜单：detect
 */
export function createDetectOption(): MenuOption<CliRuntimeContext> {
  return {
    input: '1',
    name: 'detect',
    desc: '检测 UI 库与版本',
    async func(ctx) {
      await runDetect(ctx.context.cwd);
    },
  };
}
