import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
/**
 * 自动 External 插件
 *
 * 1. 扫描编译过程中使用到的 node_modules 依赖
 * 2. 如果这些依赖在 config.externals 中定义了，则标记为已使用
 * 3. 在 HTML 生成阶段，仅注入已使用的依赖的 importmap 或 script 标签
 */
export declare class AutoExternalPlugin {
    private externalLibNames;
    private usedExternals;
    private args;
    private config;
    constructor(args: ModuloArgs_Pack, config: GLOBAL_CONFIG);
    apply(compiler: any): void;
    private processTags;
}
