import process from 'node:process';
import { formatTitle, hr } from '@yannick-z/modulo-common';
import pc from 'picocolors';

export type CliCommand = 'detect' | 'env' | 'dev' | 'build' | 'init' | 'config';

type ReadlineInterface = ReturnType<typeof import('node:readline/promises').createInterface>;

/**
 * 输出交互式菜单。
 */
export function printMenu(): void {
  process.stdout.write(`${formatTitle('请选择要执行的操作')}\n${hr()}\n`);
  process.stdout.write(`  ${pc.cyan('1')}  检测 UI 库与版本\n`);
  process.stdout.write(`  ${pc.cyan('2')}  输出环境信息\n`);
  process.stdout.write(`  ${pc.cyan('3')}  dev（占位）\n`);
  process.stdout.write(`  ${pc.cyan('4')}  build（占位）\n`);
  process.stdout.write(`  ${pc.cyan('5')}  init（占位）\n`);
  process.stdout.write(`  ${pc.cyan('6')}  配置文件（check / init）\n`);
  process.stdout.write(`  ${pc.cyan('0')}  退出\n`);
  process.stdout.write(`${hr()}\n`);
}

/**
 * 读取用户输入并映射到 CLI 命令（交互式模式）。
 */
export async function promptSelectCommand(
  rl: ReadlineInterface,
): Promise<{ type: 'command'; command: CliCommand } | { type: 'exit' } | { type: 'invalid' }> {
  const answer = (await rl.question(pc.dim('输入序号并回车：'))).trim();

  if (answer === '0') return { type: 'exit' };
  if (answer === '1') return { type: 'command', command: 'detect' };
  if (answer === '2') return { type: 'command', command: 'env' };
  if (answer === '3') return { type: 'command', command: 'dev' };
  if (answer === '4') return { type: 'command', command: 'build' };
  if (answer === '5') return { type: 'command', command: 'init' };
  if (answer === '6') return { type: 'command', command: 'config' };
  return { type: 'invalid' };
}

/**
 * 命令执行完毕后的“暂停”提示，用户按回车后继续显示菜单。
 */
export async function waitForAnyKey(rl: ReadlineInterface): Promise<void> {
  void (await rl.question(pc.dim('按回车键继续...')));
}
