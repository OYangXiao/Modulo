/**
 * CLI 的“非打包”能力集合。
 *
 * 该包用于承载与构建无关但又属于脚手架范畴的通用能力，例如：
 * - 环境检测
 * - 项目初始化（后续会逐步实现）
 * - 交互/非交互式的参数准备与校验
 */

import { isRecord } from '@yannick-z/modulo-common';

export {
  type EnvironmentInfo,
  ensureMinNodeMajorVersion,
  ensureNode24Plus,
  getEnvironmentInfo,
  MIN_NODE_MAJOR_VERSION,
} from './mods/node-env.ts';

export {
  detectUiLibraries,
  type SupportedUiLibrary,
  UiLibraryDetectionError,
  type UiLibraryDetectionErrorCode,
  type UiLibraryName,
  type UiLibraryReport,
  type UiLibraryReportItem,
} from './mods/ui-library.ts';

export interface InitProjectOptions {
  name: string;
  template: string;
}

/**
 * 项目初始化入口（占位）。
 */
export async function initProject(options: InitProjectOptions): Promise<void> {
  if (!isRecord(options) || typeof options.name !== 'string' || typeof options.template !== 'string') {
    throw new Error('Invalid init project options.');
  }

  void options;
}
