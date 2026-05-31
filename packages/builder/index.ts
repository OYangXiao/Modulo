/**
 * 构建与开发服务器能力集合。
 *
 * 该包的职责是提供底层的 build / dev-server 能力，并以可组合的 API 形式暴露给 CLI。
 * 具体的打包实现与框架适配会在后续逐步补齐。
 */

export type BuilderCommand = 'dev' | 'build';

export interface BuilderContext {
  cwd: string;
  command: BuilderCommand;
}

export interface Builder {
  run(): Promise<void>;
}

/**
 * 创建 Builder 实例（占位）。
 */
export function createBuilder(context: BuilderContext): Builder {
  void context;
  return {
    async run() {},
  };
}
