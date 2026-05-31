/**
 * 判断字符串是否为合法的 JS/TS 标识符（用于对象字面量 key 的输出）。
 */
function isValidIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

/**
 * 将字符串转义为单引号字符串字面量内容。
 */
function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}

/**
 * 将 JS 值格式化为可写入 TS 文件的字面量表达式（用于生成配置文件）。
 *
 * 目标：
 * - 输出稳定、可读的对象字面量
 * - 避免引入额外格式化依赖
 *
 * 限制：
 * - 仅覆盖 JSON 兼容值 + undefined（对象/数组/字符串/数字/布尔/null/undefined）
 * - 不支持函数、Symbol、BigInt、Date、Map/Set 等复杂类型
 */
function formatTsValue(value: unknown, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);
  const nextIndent = '  '.repeat(indentLevel + 1);

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (typeof value === 'string') return `'${escapeString(value)}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${nextIndent}${formatTsValue(v, indentLevel + 1)},`);
    return `[\n${items.join('\n')}\n${indent}]`;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 0) return '{}';

    const lines = keys.map((k) => {
      const key = isValidIdentifier(k) ? k : `'${escapeString(k)}'`;
      const v = record[k];
      return `${nextIndent}${key}: ${formatTsValue(v, indentLevel + 1)},`;
    });

    return `{\n${lines.join('\n')}\n${indent}}`;
  }

  return 'undefined';
}

/**
 * 生成 `modulo.config.ts` 文件内容：
 *
 * ```ts
 * import { defineConfig } from '@yannick-z/modulo';
 *
 * export default defineConfig({...});
 * ```
 */
export function formatConfigFileTs(config: unknown): string {
  const body = formatTsValue(config, 0);
  return `import { defineConfig } from '@yannick-z/modulo';

export default defineConfig(${body});
`;
}
