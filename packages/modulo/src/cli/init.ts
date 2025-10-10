import type { Modulo_Init_Args } from "../args/index.ts";
import { create_config_file } from "../initiator/create-config-file.ts";
import { modify_scripts } from "../initiator/modify-scripts.ts";

export function init_tool(args: Modulo_Init_Args) {
  if (args.target === "config") {
    create_config_file(args);
  }
  if (args.target === "script") {
    modify_scripts();
  }
}
