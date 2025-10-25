import type minimist from "minimist";
import { expect } from "../../tools/expect.ts";

const cmd_list = ["build", "dev", "init"];

// 命令
export function get_cmd(argv: minimist.ParsedArgs) {
  const cmd = argv._[0];

  expect(cmd_list.includes(cmd)).halt(
    `modulo只支持 ${cmd_list.join(" 或 ")} 命令`,
  );

  return cmd as Modulo_Build_Cmd | Modulo_Init_Cmd;
}
