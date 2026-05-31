import type { ModuloArgs_Pack } from "../args/index.ts";
import { type ExternalLibs } from "../config/type.ts";
/**
 * 解析 External 配置，生成 externals 对象和 importMap
 * @param args CLI 参数
 * @param externalLibs 外部依赖配置
 * @param externalsType External 类型（importmap 或 script）
 * @returns externals 和 importMap
 */
export declare function getExternalsAndImportMap(args: ModuloArgs_Pack, externalLibs: ExternalLibs, externalsType?: "importmap" | "script"): {
    externals: Record<string, string>;
    importMap: Record<string, string>;
};
