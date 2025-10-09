import { get_args } from "./args/index.ts";
import { init_tool } from "./cli/init.ts";
import { build_code } from "./cli/build.ts";

export function exec() {
  const args = get_args();

  if (args.cmd === "init") {
    init_tool(args);
  } else if (args.cmd === "build" || args.cmd === "dev") {
    build_code(args);
  }
}

export { create_config } from "./config/merge-config.ts";
