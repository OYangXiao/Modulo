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

function hr(): string {
  return pc.dim('─'.repeat(72));
}

function formatTitle(title: string): string {
  return pc.bold(title);
}

function formatOk(text: string): string {
  return pc.green(text);
}

function formatWarn(text: string): string {
  return pc.yellow(text);
}

function formatError(text: string): string {
  return pc.red(text);
}

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

async function promptSelectCommand(): Promise<CliCommand | null> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return null;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    process.stdout.write(`${formatTitle('请选择要执行的操作')}\n${hr()}\n`);
    process.stdout.write(`  ${pc.cyan('1')}  检测 UI 库与版本\n`);
    process.stdout.write(`  ${pc.cyan('2')}  输出环境信息\n`);
    process.stdout.write(`  ${pc.cyan('3')}  dev（占位）\n`);
    process.stdout.write(`  ${pc.cyan('4')}  build（占位）\n`);
    process.stdout.write(`  ${pc.cyan('5')}  init（占位）\n`);
    process.stdout.write(`${hr()}\n`);
    const answer = (await rl.question(pc.dim('输入序号并回车：'))).trim();

    if (answer === '1') return 'detect';
    if (answer === '2') return 'env';
    if (answer === '3') return 'dev';
    if (answer === '4') return 'build';
    if (answer === '5') return 'init';
    return null;
  } finally {
    await rl.close();
  }
}

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

async function runEnv(): Promise<void> {
  const info = getEnvironmentInfo();
  process.stdout.write(`${formatTitle('环境信息')}\n${hr()}\n`);
  process.stdout.write(`- node: ${info.nodeVersion}\n`);
  process.stdout.write(`- platform: ${info.platform}\n`);
  process.stdout.write(`- arch: ${info.arch}\n`);
}

async function runDev(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'dev' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} dev 已结束（当前为占位实现）\n`);
}

async function runBuild(cwd: string): Promise<void> {
  await runDetect(cwd);
  const builder = createBuilder({ cwd, command: 'build' });
  await builder.run();
  process.stdout.write(`${formatOk('OK')} build 已结束（当前为占位实现）\n`);
}

async function runInit(): Promise<void> {
  process.stdout.write(`${formatWarn('WARN')} init 暂未实现\n`);
}

export async function runCli(options: CliRunOptions = {}): Promise<void> {
  ensureNode24Plus();

  const argv = options.argv ?? process.argv;
  const defaultCwd = options.cwd ?? process.cwd();

  const argsOnly = argv.slice(2);
  if (argsOnly.length === 0) {
    const command = await promptSelectCommand();
    if (!command) {
      process.stderr.write(`${formatError('ERROR')} 未选择有效命令\n`);
      process.exitCode = 1;
      return;
    }

    try {
      process.stdout.write(`${formatTitle('modulo')}\n${hr()}\n`);
      if (command === 'detect') await runDetect(defaultCwd);
      else if (command === 'env') await runEnv();
      else if (command === 'dev') await runDev(defaultCwd);
      else if (command === 'build') await runBuild(defaultCwd);
      else await runInit();
      return;
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
      return;
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
