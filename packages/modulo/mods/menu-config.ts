import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  createDefaultUserConfig,
  DEFAULT_CONFIG_FILE_NAME,
  fileExists,
  formatError,
  formatOk,
  formatTitle,
  formatWarn,
  hr,
} from '@yannick-z/modulo-common';
import pc from 'picocolors';
import { formatConfigFileTs } from '../utils/ts-format.ts';
import { waitForAnyKey } from './menu-index.ts';

type ReadlineInterface = ReturnType<typeof import('node:readline/promises').createInterface>;

/**
 * 解析当前项目的配置文件路径。
 */
function resolveConfigPath(cwd: string): string {
  return path.resolve(cwd, DEFAULT_CONFIG_FILE_NAME);
}

/**
 * 检查配置文件是否存在，并输出友好的提示信息。
 */
export async function configCheck(cwd: string): Promise<boolean> {
  const configPath = resolveConfigPath(cwd);
  const exists = await fileExists(configPath);

  if (exists) {
    process.stdout.write(`${formatOk('OK')} 已找到配置文件：${configPath}\n`);
    return true;
  }

  process.stderr.write(`${formatError('ERROR')} 未找到配置文件：${configPath}\n`);
  process.stderr.write(`请执行：modulo config\n`);
  return false;
}

/**
 * 交互式确认是否覆盖已存在的配置文件。
 */
async function confirmOverwrite(rl: ReadlineInterface, filePath: string): Promise<boolean> {
  const answer = (await rl.question(pc.dim(`配置文件已存在：${filePath}\n是否覆盖？(y/N)：`))).trim().toLowerCase();
  return answer === 'y' || answer === 'yes';
}

/**
 * 在当前项目目录生成默认的 `modulo.config.ts` 配置文件。
 *
 * - 若文件已存在：交互模式下询问是否覆盖；非交互模式下需使用 --force
 * - 生成内容来自 common 包内的默认配置对象，并格式化为 TS 文件
 */
export async function configInit(
  cwd: string,
  options: { force: boolean; interactive: boolean; rl?: ReadlineInterface },
): Promise<void> {
  const configPath = resolveConfigPath(cwd);
  const exists = await fileExists(configPath);

  if (exists && !options.force) {
    if (!options.interactive || !options.rl) {
      throw new Error(`配置文件已存在：${configPath}。如需覆盖请执行 modulo config 进入交互菜单或使用 --force。`);
    }

    const ok = await confirmOverwrite(options.rl, configPath);
    if (!ok) {
      process.stdout.write(`${formatWarn('WARN')} 已取消覆盖\n`);
      return;
    }
  }

  const content = formatConfigFileTs(createDefaultUserConfig());
  await writeFile(configPath, content, 'utf8');
  process.stdout.write(`${formatOk('OK')} 已生成配置文件：${configPath}\n`);
}

/**
 * 输出 config 子菜单（交互式模式）。
 */
function printConfigMenu(): void {
  process.stdout.write(`${formatTitle('config')}\n${hr()}\n`);
  process.stdout.write(`  ${pc.cyan('1')}  check  ${pc.dim('检测是否存在 modulo.config.ts')}\n`);
  process.stdout.write(`  ${pc.cyan('2')}  init   ${pc.dim('生成默认 modulo.config.ts（存在则询问是否覆盖）')}\n`);
  process.stdout.write(`  ${pc.cyan('0')}  返回\n`);
  process.stdout.write(`${hr()}\n`);
}

/**
 * 读取用户输入并映射到 config 子菜单操作。
 */
async function promptSelectConfigAction(
  rl: ReadlineInterface,
): Promise<{ type: 'check' } | { type: 'init' } | { type: 'back' } | { type: 'invalid' }> {
  const answer = (await rl.question(pc.dim('输入序号并回车：'))).trim();
  if (answer === '0') return { type: 'back' };
  if (answer === '1') return { type: 'check' };
  if (answer === '2') return { type: 'init' };
  return { type: 'invalid' };
}

/**
 * 运行 config 子菜单循环。
 */
export async function runConfigMenu(rl: ReadlineInterface, cwd: string): Promise<void> {
  while (true) {
    process.stdout.write('\n');
    printConfigMenu();
    const action = await promptSelectConfigAction(rl);
    if (action.type === 'back') return;
    if (action.type === 'invalid') {
      process.stderr.write(`${formatError('ERROR')} 无效输入，请重新选择\n`);
      continue;
    }

    try {
      if (action.type === 'check') {
        await configCheck(cwd);
      } else {
        await configInit(cwd, { force: false, interactive: true, rl });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${formatError('ERROR')} ${message}\n`);
    }

    process.stdout.write(`\n${hr()}\n`);
    await waitForAnyKey(rl);
  }
}
