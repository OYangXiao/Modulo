import type { preset_ui_libs } from "../config/presets.ts";

export interface ModuloArgs_Pack {
	cmd: "build" | "dev" | "preview";
	target: "page" | "module" | "all";
	pack: {
		config?: string;
		env: "dev" | "prd";
		watch: boolean;
		esm: boolean;
	};
}

export interface ModuloArgs_Init {
	cmd: "init";
	target: "config" | "script" | "project";
	init: {
		path: string;
		force: boolean;
		preset: keyof typeof preset_ui_libs;
	};
}
