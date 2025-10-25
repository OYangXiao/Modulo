import { get_args } from "./cli/args/resolve.ts";
import { init_tool } from "./cli/index.ts";
import { build_code } from "./cli/build.ts";

export function exec() {
  const args = get_args();

  if (args.cmd === "init") {
    init_tool(args);
  } else if (args.cmd === "build" || args.cmd === "dev") {
    build_code(args);
  }
}

export { create_config } from "./build/config/merge-config.ts";
export type { Modulo_Build_Args } from "./cli/args/resolve.ts";
