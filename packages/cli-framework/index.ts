import path from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import pc from 'picocolors';
import { formatError, formatTitle, hr } from './utils/cli-format.ts';

/**
 * 通用 CLI 框架（业务无关）。
 *
 * - 通过菜单配置（title/options）驱动交互式菜单
 * - 支持子菜单、返回/退出、统一的输入处理与错误输出
 * - 支持 Ctrl-C / AbortError 的正常退出
 */
export type MenuOption<TContext> = {
  /**
   * 菜单输入匹配（例如 `1` / `0` / `y` / `n`），支持多个别名。
   */
  input: string | string[];
  /**
   * 选项名（用于非交互式命令分发，例如：`modulo config init`）。
   */
  name: string;
  /**
   * 选项说明（会以灰色显示在菜单右侧）。
   */
  desc?: string;
  /**
   * 子菜单选项（若提供，表示该选项是一个“子菜单入口”）。
   */
  options?: MenuOption<TContext>[];
  /**
   * 选中后执行的函数。
   */
  func?: (ctx: MenuContext<TContext>) => void | Promise<void>;
};

export type MenuDefinition<TContext> = {
  /**
   * 菜单标题。
   */
  title: string;
  options: MenuOption<TContext>[];
};

export type RunMenuOptions<TContext> = {
  context: TContext;
  prompt?: string;
  pauseText?: string;
  titlePath?: string[];
};

export type MenuContext<TContext> = {
  context: TContext;
  print: (text: string) => void;
  error: (text: string) => void;
  question: (text: string) => Promise<string>;
  openMenu: (menu: MenuDefinition<TContext>) => Promise<void>;
  exit: () => void;
  back: () => void;
};

export type CliRuntimeContext = {
  /**
   * 当前工作目录（支持通过 `-C/--cwd` 覆盖）。
   */
  cwd: string;
  /**
   * 完整 argv（用于读取 flags，例如 `--force`）。
   */
  argv: string[];
};

export { formatError, formatOk, formatTitle, formatWarn, hr } from './utils/cli-format.ts';

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const maybeCode = (error as { code?: unknown }).code;
  return error.name === 'AbortError' || maybeCode === 'ABORT_ERR';
}

function normalizeInput(input: string): string {
  return input.trim().toLowerCase();
}

function toInputList(input: string | string[]): string[] {
  return Array.isArray(input) ? input : [input];
}

function formatMenuLine(option: MenuOption<unknown>): string {
  const input = toInputList(option.input)[0] ?? '';
  const inputLabel = pc.cyan(input);
  const name = option.name;
  const desc = option.desc ? `  ${pc.dim(option.desc)}` : '';
  return `  ${inputLabel}  ${name}${desc}\n`;
}

function formatTitlePath(titlePath: string[]): string {
  return `${formatTitle(titlePath.join(' -> '))}`;
}

function renderMenu<TContext>(menu: MenuDefinition<TContext>, titlePath: string[]): void {
  process.stdout.write(`${formatTitlePath(titlePath)}\n${hr()}\n`);
  for (const opt of menu.options) {
    process.stdout.write(formatMenuLine(opt as MenuOption<unknown>));
  }
  process.stdout.write(`${hr()}\n`);
}

function findOption<TContext>(menu: MenuDefinition<TContext>, rawInput: string): MenuOption<TContext> | null {
  const normalized = normalizeInput(rawInput);
  for (const opt of menu.options) {
    for (const key of toInputList(opt.input)) {
      if (normalizeInput(key) === normalized) return opt;
    }
  }
  return null;
}

function findOptionByName<TContext>(menu: MenuDefinition<TContext>, rawName: string): MenuOption<TContext> | null {
  const normalized = normalizeInput(rawName);
  for (const opt of menu.options) {
    if (normalizeInput(opt.name) === normalized) return opt;
  }
  return null;
}

/**
 * 以交互式方式运行一个菜单（循环渲染、等待输入、执行选项）。
 */
export async function runMenu<TContext>(menu: MenuDefinition<TContext>, options: RunMenuOptions<TContext>): Promise<void> {
  const prompt = options.prompt ?? pc.dim('输入序号并回车：');
  const pauseText = options.pauseText ?? pc.dim('按回车键继续...');
  const initialTitlePath = options.titlePath ?? [menu.title];

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let interrupted = false;

  const onSigint = () => {
    interrupted = true;
    process.stdout.write('\n');
    rl.close();
  };
  process.on('SIGINT', onSigint);

  try {
    const runMenuInternal = async (
      current: MenuDefinition<TContext>,
      titlePath: string[],
    ): Promise<'exit' | 'back' | 'done'> => {
      while (true) {
        let shouldExit = false;
        let shouldBack = false;
        let navigated = false;

        const ctx: MenuContext<TContext> = {
          context: options.context,
          print(text) {
            process.stdout.write(text);
          },
          error(text) {
            process.stderr.write(text);
          },
          async question(text) {
            return await rl.question(text);
          },
          async openMenu(next) {
            navigated = true;
            const result = await runMenuInternal(next, [...titlePath, next.title]);
            if (result === 'exit') shouldExit = true;
          },
          exit() {
            shouldExit = true;
          },
          back() {
            shouldBack = true;
          },
        };

        renderMenu(current, titlePath);

        let answer = '';
        try {
          answer = await rl.question(prompt);
        } catch (error) {
          if (interrupted || isAbortError(error)) return 'exit';
          throw error;
        }

        const option = findOption(current, answer);
        if (!option) {
          process.stderr.write(`${formatError('ERROR')} 无效输入，请重新选择\n\n`);
          continue;
        }

        try {
          if (option.func) {
            await option.func(ctx);
          } else if (option.options) {
            await ctx.openMenu({ title: option.name, options: option.options });
          }
        } catch (error) {
          if (interrupted || isAbortError(error)) return 'exit';
          const message = error instanceof Error ? error.message : String(error);
          process.stderr.write(`${formatError('ERROR')} ${message}\n`);
        }

        if (shouldExit) return 'exit';
        if (shouldBack) return 'back';
        if (navigated) {
          process.stdout.write('\n');
          continue;
        }

        process.stdout.write(`\n${hr()}\n`);
        try {
          await rl.question(pauseText);
        } catch (error) {
          if (interrupted || isAbortError(error)) return 'exit';
          throw error;
        }
        process.stdout.write('\n');
      }
    };

    await runMenuInternal(menu, initialTitlePath);
  } finally {
    process.off('SIGINT', onSigint);
    await rl.close();
  }
}

export type CreateCliMenuOptions = {
  argv?: string[];
  cwd?: string;
  readVersion?: () => Promise<string | null>;
};

function parseGlobalArgs(argv: string[]): { cwd?: string; help: boolean; version: boolean; rest: string[] } {
  const rest: string[] = [];
  let cwd: string | undefined;
  let help = false;
  let version = false;

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '-C' || a === '--cwd') {
      const next = argv[i + 1];
      if (typeof next === 'string') {
        cwd = next;
        i += 1;
      }
      continue;
    }
    if (a === '-h' || a === '--help') {
      help = true;
      continue;
    }
    if (a === '-v' || a === '--version') {
      version = true;
      continue;
    }
    if (a.startsWith('-')) {
      continue;
    }
    rest.push(a);
  }

  return { cwd, help, version, rest };
}

function renderHelp(menu: MenuDefinition<unknown>): void {
  process.stdout.write(`${formatTitle(menu.title)}\n${hr()}\n`);
  for (const opt of menu.options) {
    const desc = opt.desc ? `  ${pc.dim(opt.desc)}` : '';
    process.stdout.write(`  ${pc.cyan(opt.name)}${desc}\n`);
  }
  process.stdout.write(`${hr()}\n`);
}

/**
 * 创建并运行 CLI。
 *
 * createCliMenu 同时支持两种模式：
 * - 交互式：未提供命令时进入菜单循环
 * - 非交互式：提供命令时按 `name` 分发（支持子命令通过 `menu` 递进）
 */
export async function createCliMenu(
  menu: MenuDefinition<CliRuntimeContext>,
  options: CreateCliMenuOptions = {},
): Promise<void> {
  const argv = options.argv ?? process.argv;
  const parsed = parseGlobalArgs(argv.slice(2));
  const cwd = pathResolveCwd(options.cwd, parsed.cwd);

  if (parsed.version) {
    const version = (await options.readVersion?.()) ?? '0.0.0';
    process.stdout.write(`${version}\n`);
    return;
  }

  if (parsed.help) {
    renderHelp(menu as MenuDefinition<unknown>);
    return;
  }

  if (parsed.rest.length === 0) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      process.stderr.write(`${formatError('ERROR')} 未提供命令且当前不是交互终端\n`);
      process.stderr.write(`请使用：${menu.title} <command>\n`);
      process.exitCode = 1;
      return;
    }
    await runMenu(menu, { context: { cwd, argv } });
    return;
  }

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  let rl: ReturnType<typeof createInterface> | undefined;
  let interrupted = false;

  const onSigint = () => {
    interrupted = true;
    process.stdout.write('\n');
    rl?.close();
  };
  process.on('SIGINT', onSigint);

  const ctx: MenuContext<CliRuntimeContext> = {
    context: { cwd, argv },
    print(text) {
      process.stdout.write(text);
    },
    error(text) {
      process.stderr.write(text);
    },
    async question(text) {
      if (!interactive) throw new Error('当前不是交互终端，无法提问。');
      rl ??= createInterface({ input: process.stdin, output: process.stdout });
      try {
        return await rl.question(text);
      } catch (error) {
        if (interrupted || isAbortError(error)) throw error;
        throw error;
      }
    },
    async openMenu(next) {
      if (!interactive) {
        process.stderr.write(`${pc.red('ERROR')} 当前不是交互终端，无法进入子菜单\n`);
        process.exitCode = 1;
        return;
      }
      await runMenu(next, { context: { cwd, argv }, titlePath: [menu.title, next.title] });
    },
    exit() {},
    back() {},
  };

  try {
    let current: MenuDefinition<CliRuntimeContext> = menu;
    let option: MenuOption<CliRuntimeContext> | null = null;

    for (let i = 0; i < parsed.rest.length; i += 1) {
      const token = parsed.rest[i]!;
      option = findOptionByName(current, token);
      if (!option) {
        process.stderr.write(`${formatError('ERROR')} 未知命令：${token}\n`);
        renderHelp(current as unknown as MenuDefinition<unknown>);
        process.exitCode = 1;
        return;
      }

      const isLast = i === parsed.rest.length - 1;
      if (!isLast) {
        if (!option.options) {
          process.stderr.write(`${formatError('ERROR')} 命令不支持子操作：${token}\n`);
          process.exitCode = 1;
          return;
        }
        current = { title: option.name, options: option.options };
        continue;
      }

      if (option.options && !option.func) {
        await ctx.openMenu({ title: option.name, options: option.options });
        return;
      }

      if (!option.func) {
        process.stderr.write(`${formatError('ERROR')} 命令不可执行：${token}\n`);
        process.exitCode = 1;
        return;
      }

      try {
        await option.func(ctx);
      } catch (error) {
        if (interrupted || isAbortError(error)) return;
        throw error;
      }
      return;
    }
  } catch (error) {
    if (interrupted || isAbortError(error)) return;
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${formatError('ERROR')} ${message}\n`);
    process.exitCode = 1;
  } finally {
    process.off('SIGINT', onSigint);
    if (rl) await rl.close();
  }
}

function pathResolveCwd(base: string | undefined, override: string | undefined): string {
  const raw = override ?? base ?? process.cwd();
  return path.resolve(raw);
}
