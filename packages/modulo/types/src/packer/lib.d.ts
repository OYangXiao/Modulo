import type { ModuloArgs_Pack } from "../args/index.ts";
/**
 * 执行库（module）打包
 *
 * 使用 Rslib 将模块目录下的代码打包为 ESM 和 UMD 格式。
 *
 * @param args CLI 参数
 */
export declare function lib_pack(args: ModuloArgs_Pack): Promise<void>;
