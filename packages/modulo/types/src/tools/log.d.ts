/**
 * 调试日志函数
 *
 * 仅在 process.env.DEBUG 开启或 CLI 参数包含 --debug/--verbose 时输出。
 * - --verbose: 直接输出到控制台
 * - --debug: 输出日志文件到当前目录的 modulo.debug.log，并在控制台打印序号
 *
 * @param hint 日志标题或提示信息
 * @param params 日志内容（可以是任意对象）
 */
export declare function debug_log(hint: string, ...params: unknown[]): void;
export declare const logger: {
    info: (msg: string) => void;
    success: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
    debug: (msg: string) => void;
};
