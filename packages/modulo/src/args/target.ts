import type minimist from "minimist";
import { expect } from "../tools/expect.ts";
import type { ModuloCmd_Init, ModuloCmd_Build } from "./cmd.ts";

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

export function get_cmd_target<T extends ModuloCmd_Build | ModuloCmd_Init>(
  argv: minimist.ParsedArgs,
  cmd: T
) {
  const target = argv._[1];

  const target_list = options[cmd];

  expect(
    !(target in target_list),
    `modulo ${cmd} 命令缺少必须得参数\n例如 ${Object.entries(target_list).map(
      ([k, v]) => `\n${k} : ${v}`
    )}`
  );

  return target as T extends ModuloCmd_Init
    ? ModuloTarget_Init
    : ModuloTarget_Pack;
}
