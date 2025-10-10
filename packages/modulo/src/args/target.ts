import type minimist from "minimist";
import { expect } from "../tools/expect.ts";
import type { Modulo_Init_Cmd, Modulo_Build_Cmd } from "./cmd.ts";

const build_options = {
  page: "构建页面",
  module: "构建模块",
  all: "页面和模块",
};
const init_options = {
  config: "modulo的配置文件",
  script: "package.json中modulo的启动命令",
};
const options = {
  build: build_options,
  dev: {
    page: build_options.page,
    module: build_options.module,
  },
  init: init_options,
};

export type Modulo_Build_Target = keyof typeof build_options;
export type Modulo_Init_Target = keyof typeof init_options;

export function get_cmd_target<T extends Modulo_Build_Cmd | Modulo_Init_Cmd>(
  argv: minimist.ParsedArgs,
  cmd: T
) {
  const target = argv._[1];

  const target_list = options[cmd];

  expect(target in target_list).halt(
    `modulo ${cmd} 命令缺少必须得参数\n例如 ${Object.entries(target_list).map(
      ([k, v]) => `\n${k} : ${v}`
    )}`
  );

  return target as T extends Modulo_Init_Cmd
    ? Modulo_Init_Target
    : Modulo_Build_Target;
}
