import pc from 'picocolors';

/**
 * 输出分割线，用于在 CLI 中区分不同区域的输出内容。
 */
export function hr(): string {
  return pc.dim('─'.repeat(72));
}

/**
 * 标题样式。
 */
export function formatTitle(title: string): string {
  return pc.bold(title);
}

/**
 * 成功标识样式。
 */
export function formatOk(text: string): string {
  return pc.green(text);
}

/**
 * 警告标识样式。
 */
export function formatWarn(text: string): string {
  return pc.yellow(text);
}

/**
 * 错误标识样式。
 */
export function formatError(text: string): string {
  return pc.red(text);
}
