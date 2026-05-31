import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { CliRuntimeContext, MenuOption } from '@yannick-z/modulo-cli-framework';
import { formatError, formatOk, formatWarn } from '@yannick-z/modulo-cli-framework';
import {
  createDefaultUserConfig,
  DEFAULT_CONFIG_FILE_NAME,
  fileExists,
} from '@yannick-z/modulo-common';
import { formatConfigFileTs } from '../utils/ts-format.ts';

/**
 * config 子菜单：生成/检查 `modulo.config.ts`。
 */

function resolveConfigPath(cwd: string): string {
  return path.resolve(cwd, DEFAULT_CONFIG_FILE_NAME);
}

async function configCheck(cwd: string): Promise<boolean> {
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

function hasFlag(argv: string[], names: string[]): boolean {
  const set = new Set(names);
  return argv.some((a) => set.has(a));
}

async function configInit(
  cwd: string,
  options: { force: boolean; interactive: boolean; question?: (text: string) => Promise<string> },
): Promise<void> {
  const configPath = resolveConfigPath(cwd);
  const exists = await fileExists(configPath);

  if (exists && !options.force) {
    if (!options.interactive || !options.question) {
      throw new Error(`配置文件已存在：${configPath}。如需覆盖请使用 --force。`);
    }
    const answer = (await options.question(`配置文件已存在：${configPath}\n是否覆盖？(y/N)：`)).trim().toLowerCase();
    const ok = answer === 'y' || answer === 'yes';
    if (!ok) {
      process.stdout.write(`${formatWarn('WARN')} 已取消覆盖\n`);
      return;
    }
  }

  const content = formatConfigFileTs(createDefaultUserConfig());
  await writeFile(configPath, content, 'utf8');
  process.stdout.write(`${formatOk('OK')} 已生成配置文件：${configPath}\n`);
}

function createConfigOptions(): MenuOption<CliRuntimeContext>[] {
  return [
    {
      input: '1',
      name: 'check',
      desc: '检测是否存在 modulo.config.ts',
      async func(ctx) {
        await configCheck(ctx.context.cwd);
      },
    },
    {
      input: '2',
      name: 'init',
      desc: '生成默认 modulo.config.ts（存在则询问是否覆盖）',
      async func(ctx) {
        const force = hasFlag(ctx.context.argv, ['--force', '-f']);
        await configInit(ctx.context.cwd, {
          force,
          interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
          question: ctx.question,
        });
      },
    },
    {
      input: '0',
      name: 'back',
      desc: '返回',
      func(ctx) {
        ctx.back();
      },
    },
  ];
}

/**
 * 一级菜单：config（包含 check / init 子菜单）。
 */
export function createConfigOption(): MenuOption<CliRuntimeContext> {
  return {
    input: '6',
    name: 'config',
    desc: '配置文件（check / init）',
    options: createConfigOptions(),
  };
}
