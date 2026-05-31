import process from 'node:process';
import { formatOk } from '@yannick-z/modulo-common';
import { detectUiLibraries } from '@yannick-z/modulo-helper';

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
