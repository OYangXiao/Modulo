/**
 * modulo CLI 功能汇总入口。
 *
 * 该包负责将 builder（构建能力）与 helper（脚手架能力）组合为对外的统一入口。
 * 目前仅搭建对外 API 形态，具体 CLI 命令与参数体系后续逐步实现。
 */

export { createBuilder } from '@modulo/builder';
export type { Builder, BuilderCommand, BuilderContext } from '@modulo/builder';

export { ensureMinNodeMajorVersion, getEnvironmentInfo, initProject } from '@modulo/helper';
export type { EnvironmentInfo, InitProjectOptions } from '@modulo/helper';

export type { MaybePromise } from '@modulo/common';
export { assertNever, isRecord, noop } from '@modulo/common';

export interface ModuloCliOptions {
  cwd?: string;
  argv?: string[];
}

/**
 * CLI 入口（占位）。
 */
export async function runModuloCli(options: ModuloCliOptions = {}): Promise<void> {
  void options;
}
