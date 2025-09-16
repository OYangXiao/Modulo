import minimist from "minimist";
import { default_config_file_name } from "../config/example/example-config.ts";
import type { preset_ui_libs } from "../config/preset/libs.ts";
import { get_cmd, type ModuloCmd_Init, type ModuloCmd_Pack } from "./cmd.ts";
import { get_mode } from "./mode.ts";
import { set_node_env } from "./node_env.ts";
import { get_preset_for_init } from "./preset.ts";
import {
  get_cmd_target,
  type ModuloTarget_Init,
  type ModuloTarget_Pack,
} from "./target.ts";

export interface ModuloArgs_Pack {
  cmd: ModuloCmd_Pack;
  target: ModuloTarget_Pack;
  pack: {
    config: string;
    mode: "dev" | "prd";
    watch: boolean;
    esm: boolean;
  };
}

export interface ModuloArgs_Init {
  cmd: ModuloCmd_Init;
  target: ModuloTarget_Init;
  init: {
    path: string;
    force: boolean;
    preset: keyof typeof preset_ui_libs;
  };
}

let args: ModuloArgs_Init | ModuloArgs_Pack;

const argv = minimist(process.argv.slice(2));
export const argv_debug = argv.debug === "true";
export const argv_verbose = argv.verbose === "true" || argv.v;

export function get_args() {
  if (!args) {
    const cmd = get_cmd(argv);

    if (cmd === "build" || cmd === "dev") {
      const target = get_cmd_target(argv, cmd);
      // watch只能对单个构建目标使用
      const watch = target === "all" ? false : argv.watch === "true" || argv.w;
      args = {
        cmd,
        target,
        // 是否是调试modulo
        pack: {
          // 配置文件路径
          config:
            (argv.config as string | undefined) || default_config_file_name,
          // 运行模式, dev | prd
          mode: cmd === "build" || cmd === "dev" ? get_mode(argv, cmd) : "prd",
          watch,
          esm: argv.format === "esm" || argv.f === "esm",
        },
      };
      args.pack.mode && set_node_env(args.pack.mode);
    } else {
      args = {
        cmd,
        target: get_cmd_target(argv, cmd),
        init: {
          path: argv.path,
          force: argv.force === "true" || argv.f,
          preset: get_preset_for_init(argv),
        },
      };
    }

    if (argv_verbose) console.log("args: ", args);
  }

  return args;
}
