import type minimist from "minimist";
import { expect } from "../tools/expect.ts";

// 命令
export function get_cmd(argv: minimist.ParsedArgs) {
  const cmd_list = ["build", "dev", "init"] as const;
  const cmd = argv._[0] as (typeof cmd_list)[number];

  expect(cmd_list.includes(cmd)).halt(
    `modulo只支持 ${cmd_list.join(" 或 ")} 命令`
  );

  return cmd;
}

export type Modulo_Build_Cmd = "build" | "dev";
export type Modulo_Init_Cmd = "init";
