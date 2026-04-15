import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
/**
 * 收集模块入口文件
 * 扫描指定目录下的子目录，查找符合规则的入口文件（index/main/同名文件）
 *
 * @param args CLI 参数
 * @param kind 模块类型（page 或 module）
 * @returns 模块名到入口文件路径的映射对象，如果未找到任何模块则返回 undefined
 */
export declare function collect_modules(args: ModuloArgs_Pack, kind: "page" | "module", global_config: GLOBAL_CONFIG): Promise<{
    [k: string]: {
        entry_dir: string;
        entry: string;
        html_config: Record<string, unknown>;
    };
} | undefined>;
