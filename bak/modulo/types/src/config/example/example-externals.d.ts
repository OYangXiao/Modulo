import type { ExternalLibs } from "../type.ts";
export declare const vue2_example_externals: ExternalLibs;
export declare const react19_example_externals: ExternalLibs;
export declare const common_example_externals: ExternalLibs;
export declare const presets: {
    vue2: {
        [x: string]: string | import("../type.ts").ImportExternal | import("../type.ts").EnvExternalUrl;
    };
    react19: {
        [x: string]: string | import("../type.ts").ImportExternal | import("../type.ts").EnvExternalUrl;
    };
};
