import type { OutputConfig } from "@rsbuild/core";
import type { ExternalLibs } from "./type.ts";
export declare const preset_alias: Record<string, string>;
export declare const preset_dev_server_config: {
    open: false | string[];
    port: number;
    proxy: Record<string, string | {
        target: string;
        pathRewrite?: Record<string, string>;
        changeOrigin?: boolean;
        secure?: boolean;
    }>;
};
export type DEV_SERVER_CONFIG = typeof preset_dev_server_config;
export declare const preset_input_dirs: {
    src: string;
    pages: string;
    modules: string;
};
export declare const preset_output_dirs: {
    distPath: string;
    pages: string;
    modules: string;
    filenameHash: boolean;
};
export interface Tag {
    append?: boolean;
    attrs?: Record<string, string>;
    children?: string;
    hash?: boolean | string;
    head?: boolean;
    publicPath?: string | boolean;
    tag: string;
}
export declare const default_html_config: {
    meta: Record<string, string>;
    root: string;
    tags: Tag[];
    template: string;
    title: string;
};
export type HTML_CONFIG = typeof default_html_config;
export declare const preset_ui_libs: {
    react19: string;
    vue2: string;
};
export declare const preset_minify_config: OutputConfig["minify"];
export declare const preset_url_config: {
    base: string;
    cdn: string;
};
export declare const preset_config: {
    analyze: boolean;
    define: Record<string, string | boolean | number>;
    dev_server: {
        open: false | string[];
        port: number;
        proxy: Record<string, string | {
            target: string;
            pathRewrite?: Record<string, string>;
            changeOrigin?: boolean;
            secure?: boolean;
        }>;
    };
    externals: ExternalLibs;
    html: {
        meta: Record<string, string>;
        root: string;
        tags: Tag[];
        template: string;
        title: string;
    };
    input: {
        src: string;
        pages: string;
        modules: string;
    };
    minify: OutputConfig["minify"];
    output: {
        distPath: string;
        pages: string;
        modules: string;
        filenameHash: boolean;
    };
    ui_lib: {
        react19: string;
        vue2: string;
    };
    url: {
        base: string;
        cdn: string;
    };
    alias: Record<string, string>;
    webhost: boolean | "auto";
    autoExternal: boolean;
    externalsType: "importmap" | "script";
};
