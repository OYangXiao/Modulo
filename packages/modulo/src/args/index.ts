import minimist from "minimist";
import { default_config_file_name } from "../config/example/example-config.ts";
import {
  get_cmd,
  type Modulo_Init_Cmd as Modulo_Init_Cmd,
  type Modulo_Build_Cmd as Modulo_Build_Cmd,
} from "./cmd.ts";
import { get_env } from "./mode.ts";
import { get_preset_for_init } from "./preset.ts";
import {
  get_cmd_target,
  type Modulo_Init_Target,
  type Modulo_Build_Target,
} from "./target.ts";

export interface Modulo_Build_Args {
  cmd: Modulo_Build_Cmd;
  target: Modulo_Build_Target;
  config: string;
  env: "dev" | "prd";
  watch: boolean;
}

export interface Modulo_Init_Args {
  cmd: Modulo_Init_Cmd;
  target: Modulo_Init_Target;
  path: string;
  force: boolean;
  preset: string;
}

let args: Modulo_Init_Args | Modulo_Build_Args;

const argv = minimist(process.argv.slice(2));
// 是否是调试模式
export const argv_debug = argv.debug === "true";
// 是否是详细输出模式
export const argv_verbose = argv.verbose === "true" || argv.v;

export function get_args() {
  // 如果已经获取过参数，则直接返回缓存的内容
  if (args) return args;

  const cmd = get_cmd(argv);
  const target = get_cmd_target(argv, cmd);

  if (cmd === "build" || cmd === "dev") {
    args = {
      cmd,
      target: target as Modulo_Build_Target,
      // 配置文件路径
      config: (argv.config as string) || default_config_file_name,
      // 运行模式, dev | prd
      env: get_env(argv, cmd),
      // watch只能对单个构建目标使用
      watch: target === "all" ? false : argv.watch === "true" || argv.w,
    };
  } else {
    args = {
      cmd,
      target: target as Modulo_Init_Target,
      // 配置文件路径
      path: argv.path,
      // 是否强制覆盖
      force: argv.force === "true" || argv.f,
      // 预设
      preset: get_preset_for_init(argv),
    };
  }

  if (argv_verbose) console.log("args: ", args);

  return args;
}
