import minimist from "minimist";
import { default_config_file_name } from "../../build/config/example/example-config.ts";
import { get_cmd } from "./cmd.ts";
import { get_mode } from "./mode.ts";
import { get_cmd_target } from "./target.ts";

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
      mode: get_mode(argv, cmd),
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
