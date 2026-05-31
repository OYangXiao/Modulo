import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { formatError, formatTitle, hr } from '@yannick-z/modulo-common';
import { ensureNode24Plus, UiLibraryDetectionError } from '@yannick-z/modulo-helper';
import cac from 'cac';
import { runBuild } from './mods/menu-build.ts';
import { configCheck, configInit, runConfigMenu } from './mods/menu-config.ts';
import { runDetect } from './mods/menu-detect.ts';
import { runDev } from './mods/menu-dev.ts';
import { runEnv } from './mods/menu-env.ts';
import { printMenu, promptSelectCommand, waitForAnyKey } from './mods/menu-index.ts';
import { runInit } from './mods/menu-init.ts';
import { readSelfPackageVersion } from './mods/menu-self-version.ts';

export type { CliCommand } from './mods/menu-index.ts';

export type CliRunOptions = {
  cwd?: string;
  argv?: string[];
};

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const maybeCode = (error as { code?: unknown }).code;
  return error.name === 'AbortError' || maybeCode === 'ABORT_ERR';
}

/**
 * modulo CLI 主入口。
 *
 * - 当 argv 中未提供命令时：进入交互式循环菜单（输入 0 退出）
 * - 当 argv 中提供命令时：使用 cac 解析命令并执行一次后退出
 */
export async function runCli(options: CliRunOptions = {}): Promise<void> {
  ensureNode24Plus();

  const argv = options.argv ?? process.argv;
  const defaultCwd = options.cwd ?? process.cwd();

  const argsOnly = argv.slice(2);
  if (argsOnly.length === 0) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      process.stderr.write(`${formatError('ERROR')} 未提供命令且当前不是交互终端\n`);
      process.stderr.write(`请使用：modulo <command>\n`);
      process.exitCode = 1;
      return;
    }

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    let interrupted = false;
    const onSigint = () => {
      interrupted = true;
      process.stdout.write('\n');
      rl.close();
    };
    process.on('SIGINT', onSigint);
    try {
      while (true) {
        process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
        printMenu();
        let selection: Awaited<ReturnType<typeof promptSelectCommand>>;
        try {
          selection = await promptSelectCommand(rl);
        } catch (error) {
          if (interrupted || isAbortError(error)) return;
          throw error;
        }
        if (selection.type === 'exit') return;
        if (selection.type === 'invalid') {
          process.stderr.write(`${formatError('ERROR')} 无效输入，请重新选择\n`);
          process.stdout.write('\n');
          continue;
        }

        try {
          const command = selection.command;
          let shouldPauseAfterCommand = true;
          process.stdout.write('\n');
          if (command === 'detect') await runDetect(defaultCwd);
          else if (command === 'env') await runEnv();
          else if (command === 'dev') await runDev(defaultCwd);
          else if (command === 'build') await runBuild(defaultCwd);
          else if (command === 'init') await runInit();
          else {
            try {
              await runConfigMenu(rl, defaultCwd);
            } catch (error) {
              if (interrupted || isAbortError(error)) return;
              throw error;
            }
            shouldPauseAfterCommand = false;
          }

          if (shouldPauseAfterCommand) {
            process.stdout.write(`\n${hr()}\n`);
            try {
              await waitForAnyKey(rl);
            } catch (error) {
              if (interrupted || isAbortError(error)) return;
              throw error;
            }
            process.stdout.write('\n');
          }
        } catch (error) {
          if (interrupted || isAbortError(error)) return;
          if (error instanceof UiLibraryDetectionError) {
            process.stderr.write(`${formatError('ERROR')} ${error.code}\n`);
            process.stderr.write(`${error.message}\n`);
          } else {
            const message = error instanceof Error ? error.message : String(error);
            process.stderr.write(`${formatError('ERROR')} ${message}\n`);
          }
        }
      }
    } finally {
      process.off('SIGINT', onSigint);
      await rl.close();
    }
  }

  try {
    const cli = cac('modulo');
    cli.option('-C, --cwd <path>', '指定项目目录（默认当前目录）');

    const version = (await readSelfPackageVersion()) ?? '0.0.0';
    cli.version(version);

    cli.command('detect', '检测 UI 库（vue/react/lit）与版本').action(async (cmdOptions: { cwd?: string }) => {
      const cwd = options.cwd ?? cmdOptions.cwd ?? process.cwd();
      process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
      await runDetect(cwd);
    });

    cli.command('env', '输出环境信息（Node/平台/架构）').action(async () => {
      process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
      await runEnv();
    });

    cli.command('dev', '启动开发服务器（占位）').action(async (cmdOptions: { cwd?: string }) => {
      const cwd = options.cwd ?? cmdOptions.cwd ?? process.cwd();
      process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
      await runDev(cwd);
    });

    cli.command('build', '执行构建（占位）').action(async (cmdOptions: { cwd?: string }) => {
      const cwd = options.cwd ?? cmdOptions.cwd ?? process.cwd();
      process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
      await runBuild(cwd);
    });

    cli.command('init', '初始化项目（占位）').action(async () => {
      process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
      await runInit();
    });

    cli
      .command('config [action]', '配置文件相关操作（check / init）')
      .option('-f, --force', '覆盖已存在的配置文件（仅对 init 生效）')
      .action(async (action: string | undefined, cmdOptions: { cwd?: string; force?: boolean }) => {
        const cwd = options.cwd ?? cmdOptions.cwd ?? process.cwd();
        process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);

        if (!action) {
          const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
          if (!interactive) {
            process.stderr.write(`${formatError('ERROR')} 未提供 action 且当前不是交互终端\n`);
            process.stderr.write(`可用：config check | config init\n`);
            process.exitCode = 1;
            return;
          }

          const rl = createInterface({ input: process.stdin, output: process.stdout });
          let interrupted = false;
          const onSigint = () => {
            interrupted = true;
            process.stdout.write('\n');
            rl.close();
          };
          process.on('SIGINT', onSigint);
          try {
            try {
              await runConfigMenu(rl, cwd);
            } catch (error) {
              if (interrupted || isAbortError(error)) return;
              throw error;
            }
          } finally {
            process.off('SIGINT', onSigint);
            await rl.close();
          }
          return;
        }

        if (action === 'check') {
          const ok = await configCheck(cwd);
          if (!ok) process.exitCode = 1;
          return;
        }

        if (action === 'init') {
          const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
          const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : undefined;
          let interrupted = false;
          const onSigint = () => {
            interrupted = true;
            process.stdout.write('\n');
            rl?.close();
          };
          if (rl) process.on('SIGINT', onSigint);
          try {
            try {
              await configInit(cwd, { force: Boolean(cmdOptions.force), interactive, rl });
            } catch (error) {
              if (interrupted || isAbortError(error)) return;
              throw error;
            }
          } finally {
            if (rl) process.off('SIGINT', onSigint);
            if (rl) await rl.close();
          }
          return;
        }

        process.stderr.write(`${formatError('ERROR')} 未知 action：${action}\n`);
        process.stderr.write(`可用：config check | config init\n`);
        process.exitCode = 1;
      });

    cli.on('command:*', () => {
      const unknown = cli.args[0];
      process.stderr.write(`${formatError('ERROR')} 未知命令：${unknown ?? ''}\n`);
      cli.outputHelp();
      process.exitCode = 1;
    });

    cli.help();
    cli.parse(argv, { run: false });
    await Promise.resolve(cli.runMatchedCommand());
  } catch (error) {
    if (error instanceof UiLibraryDetectionError) {
      process.stderr.write(`${formatError('ERROR')} ${error.code}\n`);
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${formatError('ERROR')} ${message}\n`);
    process.exitCode = 1;
  }
}
