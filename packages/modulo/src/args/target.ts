import type minimist from "minimist";
import { PANIC_IF } from "../tools/panic.ts";
import type { ModuloCmd_Init, ModuloCmd_Pack } from "./cmd";

const pack_options = {
  page: "构建页面",
  module: "构建模块",
  all: "页面和模块",
};
const init_options = {
  config: "modulo的配置文件",
  script: "package.json中modulo的启动命令",
};
const options = {
  build: pack_options,
  dev: {
    page: pack_options.page,
    module: pack_options.module,
  },
  init: init_options,
};

export type ModuloTarget_Pack = keyof typeof pack_options;
export type ModuloTarget_Init = keyof typeof init_options;

export function get_cmd_target<T extends ModuloCmd_Pack | ModuloCmd_Init>(
  argv: minimist.ParsedArgs,
  cmd: T
) {
  const target = argv._[1];

  const target_list = options[cmd];

  PANIC_IF(
    !(target in target_list),
    `modulo ${cmd} 命令必须执行 ${Object.entries(target_list).map(
      ([k, v]) => `\n${k} - ${v}`
    )} 几种目标`
  );

  return target as T extends ModuloCmd_Init
    ? ModuloTarget_Init
    : ModuloTarget_Pack;
}
