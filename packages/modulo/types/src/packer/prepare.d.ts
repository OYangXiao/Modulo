import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
export declare function prepare_config(args: ModuloArgs_Pack, kind: "page" | "module", config: GLOBAL_CONFIG): {
    entries: Record<string, string> | undefined;
    externals: Record<string, string>;
    importMapsTag: any;
};
