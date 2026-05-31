export interface EnvironmentInfo {
  nodeVersion: string;
  platform: NodeJS.Platform;
  arch: string;
}

/**
 * 该仓库默认要求的 Node 主版本号。
 */
export const MIN_NODE_MAJOR_VERSION = 24;

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

/**
 * 要求 Node.js 版本必须为 24+。
 *
 * 该脚手架将默认基于 Node 24+ 的能力运行（例如直接执行 TypeScript 的工作流）。
 */
export function ensureNode24Plus(): void {
  ensureMinNodeMajorVersion(MIN_NODE_MAJOR_VERSION);
}
