import { get_args } from "./args/index.ts";
import { init_tool } from "./cli/init.ts";
import { pack_code } from "./cli/pack-code.ts";

export function exec() {
  const args = get_args();

  if (args.cmd === "init") {
    init_tool(args);
  } else if (args.cmd === "build" || args.cmd === "dev") {
    pack_code(args);
  }
}
