import type minimist from "minimist";
import { expect } from "../tools/expect.ts";

// 命令
export function get_cmd(argv: minimist.ParsedArgs) {
  const cmd_list = ["build", "dev", "init"] as const;
  const cmd = argv._[0] as (typeof cmd_list)[number];
  expect(cmd_list.includes(cmd), {
    msg: `modulo必须执行 ${cmd_list.join(" 或 ")} 命令`,
  });
  return cmd;
}

export type ModuloCmd_Build = "build" | "dev";
export type ModuloCmd_Init = "init";
