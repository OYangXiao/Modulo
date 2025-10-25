import type { Modulo_Init_Args } from "./args/resolve.ts";
import { create_config_file } from "../initiate/create-config-file.ts";
import { modify_scripts } from "../initiate/modify-scripts.ts";

export function init_tool(args: Modulo_Init_Args) {
    const { target } = args;
  if (target === "config") {
    create_config_file(args);
  }
  if (target === "script") {
    modify_scripts();
  }

  //先构建页面，防止产物目录被清理掉
  // target为all的时候不允许watch，只能分别启动两个进程
  if (target === "page" || target === "all") {
    await build_page(args);
  }

  if (target === "module" || target === "all") {
    await build_lib(args);
  }
}
import type { Modulo_Build_Args } from "./args/resolve.ts";
import { build_lib } from "../build/lib.ts";
import { build_page } from "../build/page.ts";

export async function build_code(args: Modulo_Build_Args) {

}
