import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { createBuilder } from '@yannick-z/modulo-builder';
import { detectUiLibraries, ensureNode24Plus, getEnvironmentInfo, UiLibraryDetectionError } from '@yannick-z/modulo-helper';
import cac from 'cac';
import pc from 'picocolors';

export type CliCommand = 'detect' | 'env' | 'dev' | 'build' | 'init';

export type CliRunOptions = {
  cwd?: string;
  argv?: string[];
};

/**
 * 输出分割线，用于在 CLI 中区分不同区域的输出内容。
 */
function hr(): string {
  return pc.dim('─'.repeat(72));
}

/**
 * 标题样式。
 */
function formatTitle(title: string): string {
  return pc.bold(title);
}

/**
 * 成功标识样式。
 */
function formatOk(text: string): string {
  return pc.green(text);
}

/**
 * 警告标识样式。
 */
function formatWarn(text: string): string {
  return pc.yellow(text);
}

/**
 * 错误标识样式。
 */
function formatError(text: string): string {
  return pc.red(text);
}

/**
 * 读取当前包（@yannick-z/modulo）的版本号，用于 `--version` 输出。
 */
async function readSelfPackageVersion(): Promise<string | null> {
  try {
    const pkgPath = new URL('./package.json', import.meta.url);
    const raw = await readFile(pkgPath, 'utf8');
    const json = JSON.parse(raw) as { version?: string };
    return typeof json.version === 'string' ? json.version : null;
  } catch {
    return null;
  }
}

/**
 * 输出交互式菜单。
 */
function printMenu(): void {
  process.stdout.write(`${formatTitle('请选择要执行的操作')}\n${hr()}\n`);
  process.stdout.write(`  ${pc.cyan('1')}  检测 UI 库与版本\n`);
  process.stdout.write(`  ${pc.cyan('2')}  输出环境信息\n`);
  process.stdout.write(`  ${pc.cyan('3')}  dev（占位）\n`);
  process.stdout.write(`  ${pc.cyan('4')}  build（占位）\n`);
  process.stdout.write(`  ${pc.cyan('5')}  init（占位）\n`);
  process.stdout.write(`  ${pc.cyan('0')}  退出\n`);
  process.stdout.write(`${hr()}\n`);
}

/**
 * 读取用户输入并映射到 CLI 命令（交互式模式）。
 */
async function promptSelectCommand(
  rl: ReturnType<typeof createInterface>,
): Promise<{ type: 'command'; command: CliCommand } | { type: 'exit' } | { type: 'invalid' }> {
  const answer = (await rl.question(pc.dim('输入序号并回车：'))).trim();

  if (answer === '0') return { type: 'exit' };
  if (answer === '1') return { type: 'command', command: 'detect' };
  if (answer === '2') return { type: 'command', command: 'env' };
  if (answer === '3') return { type: 'command', command: 'dev' };
  if (answer === '4') return { type: 'command', command: 'build' };
  if (answer === '5') return { type: 'command', command: 'init' };
  return { type: 'invalid' };
}

/**
 * 命令执行完毕后的“暂停”提示，用户按回车后继续显示菜单。
 */
async function waitForAnyKey(rl: ReturnType<typeof createInterface>): Promise<void> {
  void (await rl.question(pc.dim('按回车键继续...')));
}

/**
 * 执行 UI 库检测并输出报告。
 */
async function runDetect(cwd: string): Promise<void> {
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
 * 输出环境信息。
 */
async function runEnv(): Promise<void> {
  const info = getEnvironmentInfo();
  process.stdout.write(`${formatTitle('环境信息')}\n${hr()}\n`);
  process.stdout.write(`- node: ${info.nodeVersion}\n`);
  process.stdout.write(`- platform: ${info.platform}\n`);
  process.stdout.write(`- arch: ${info.arch}\n`);
}

/**
 * 启动 dev（当前为占位实现）。
 *
 * 约定：启动前先进行 UI 库检测，保证项目依赖满足脚手架支持范围。
 */
async function runDev(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'dev' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} dev 已结束（当前为占位实现）\n`);
}

/**
 * 执行 build（当前为占位实现）。
 *
 * 约定：构建前先进行 UI 库检测，保证项目依赖满足脚手架支持范围。
 */
async function runBuild(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'build' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} build 已结束（当前为占位实现）\n`);
}

/**
 * 初始化项目（当前为占位实现）。
 */
async function runInit(): Promise<void> {
  process.stdout.write(`${formatWarn('WARN')} init 暂未实现\n`);
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
    try {
      while (true) {
        process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
        printMenu();
        const selection = await promptSelectCommand(rl);
        if (selection.type === 'exit') return;
        if (selection.type === 'invalid') {
          process.stderr.write(`${formatError('ERROR')} 无效输入，请重新选择\n`);
          process.stdout.write('\n');
          continue;
        }

        try {
          const command = selection.command;
          process.stdout.write('\n');
          if (command === 'detect') await runDetect(defaultCwd);
          else if (command === 'env') await runEnv();
          else if (command === 'dev') await runDev(defaultCwd);
          else if (command === 'build') await runBuild(defaultCwd);
          else await runInit();
        } catch (error) {
          if (error instanceof UiLibraryDetectionError) {
            process.stderr.write(`${formatError('ERROR')} ${error.code}\n`);
            process.stderr.write(`${error.message}\n`);
          } else {
            const message = error instanceof Error ? error.message : String(error);
            process.stderr.write(`${formatError('ERROR')} ${message}\n`);
          }
        }

        process.stdout.write(`\n${hr()}\n`);
        await waitForAnyKey(rl);
        process.stdout.write('\n');
      }
    } finally {
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
