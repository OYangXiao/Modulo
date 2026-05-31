/**
 * CLI 的“非打包”能力集合。
 *
 * 该包用于承载与构建无关但又属于脚手架范畴的通用能力，例如：
 * - 环境检测
 * - 项目初始化（后续会逐步实现）
 * - 交互/非交互式的参数准备与校验
 */

import { isRecord } from '@modulo/common';

export interface EnvironmentInfo {
  nodeVersion: string;
  platform: NodeJS.Platform;
  arch: string;
}

/**
 * 获取当前运行环境的基础信息。
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

/**
 * 简单的 Node 主版本检测。
 */
export function ensureMinNodeMajorVersion(minMajor: number): void {
  const match = process.version.match(/^v(\d+)\./);
  const major = match ? Number(match[1]) : NaN;
  if (!Number.isFinite(major) || major < minMajor) {
    throw new Error(`Node.js version ${process.version} is not supported. Require >= v${minMajor}.x`);
  }
}

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
