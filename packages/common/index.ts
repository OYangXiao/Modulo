/**
 * 通用工具函数与类型定义。
 *
 * 该包不包含任何构建或 CLI 逻辑，仅提供可复用的最小单元能力，
 * 供 builder / cli-framework / cli-options / modulo 等包组合使用。
 */

export type MaybePromise<T> = T | Promise<T>;

/**
 * 用于穷尽性检查的辅助函数。
 */
export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${String(value)}`);
}

/**
 * 判断一个值是否为普通对象（Record）。
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 作为默认回调或占位实现使用的空函数。
 */
export function noop(): void {}

export {
  type AliasConfig,
  createDefaultUserConfig,
  DEFAULT_CONFIG_FILE_NAME,
  type DevServerConfig,
  type ExternalsType,
  type HtmlConfig,
  type InputConfig,
  type OutputConfig,
  type UrlConfig,
  type UserConfig,
} from './modulo-config.ts';

export { fileExists, findNearestFileUp, readJsonFile } from './utils/fs.ts';
