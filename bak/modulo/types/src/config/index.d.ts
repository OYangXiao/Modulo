import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "./type.ts";
/**
 * 命令启动时候的目录作为根目录
 */
export declare const root: string;
interface PackageJson {
    name: string;
    dependencies: Record<string, string>;
    scripts: undefined | Record<string, string>;
}
export declare function get_packagejson(customRoot?: string): PackageJson;
/**
 * 获取全局配置（单例模式）
 *
 * 1. 读取用户配置文件
 * 2. 处理 extends 继承逻辑
 * 3. 与默认配置进行合并
 * 4. 处理路径别名、环境变量、目录解析等
 *
 * @param args CLI 参数
 * @returns 合并后的全局配置对象
 */
export declare function get_global_config(args: ModuloArgs_Pack): Promise<GLOBAL_CONFIG>;
export {};
