/**
 * modulo 的菜单配置与业务实现（业务相关）。
 *
 * 该包只负责提供“菜单定义 + 对应业务函数”，不负责 CLI 的通用运行时行为；
 * CLI 运行时由 `@yannick-z/modulo-cli-framework` 统一承载。
 */
import { isRecord } from '@yannick-z/modulo-common';

export { moduloCliOptions } from './menus/modulo.ts';

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

export async function initProject(options: InitProjectOptions): Promise<void> {
  if (!isRecord(options) || typeof options.name !== 'string' || typeof options.template !== 'string') {
    throw new Error('Invalid init project options.');
  }

  void options;
}
