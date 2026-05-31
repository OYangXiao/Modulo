import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
export declare function prepare_config(args: ModuloArgs_Pack, kind: "page" | "module", config: GLOBAL_CONFIG): Promise<{
    entries: {
        [k: string]: {
            entry_dir: string;
            entry: string;
            html_config: Record<string, unknown>;
        };
    } | undefined;
    externals: Record<string, string>;
    importMapsTag: any;
}>;
