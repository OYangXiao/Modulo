/**
 * modulo CLI 功能汇总入口。
 *
 * 该包负责将 builder（构建能力）与 helper（脚手架能力）组合为对外的统一入口。
 * 目前仅搭建对外 API 形态，具体 CLI 命令与参数体系后续逐步实现。
 */

export type { Builder, BuilderCommand, BuilderContext } from '@yannick-z/modulo-builder';
export { createBuilder } from '@yannick-z/modulo-builder';
export type { MaybePromise } from '@yannick-z/modulo-common';
export { assertNever, isRecord, noop } from '@yannick-z/modulo-common';
export type {
  EnvironmentInfo,
  InitProjectOptions,
  SupportedUiLibrary,
  UiLibraryDetectionErrorCode,
  UiLibraryName,
  UiLibraryReport,
  UiLibraryReportItem,
} from '@yannick-z/modulo-helper';
export {
  detectUiLibraries,
  ensureMinNodeMajorVersion,
  ensureNode24Plus,
  getEnvironmentInfo,
  initProject,
  MIN_NODE_MAJOR_VERSION,
  UiLibraryDetectionError,
} from '@yannick-z/modulo-helper';

export interface ModuloCliOptions {
  cwd?: string;
  argv?: string[];
}

/**
 * CLI 入口（占位）。
 */
export async function runModuloCli(options: ModuloCliOptions = {}): Promise<void> {
  const { runCli } = await import('./cli.ts');
  await runCli({ cwd: options.cwd, argv: options.argv });
}
