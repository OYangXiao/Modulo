import type { Modulo_Build_Args } from "../args/index.ts";
import { build_lib } from "../builder/lib.ts";
import { build_page } from "../builder/page.ts";

export async function build_code(args: Modulo_Build_Args) {
  const { target } = args;

  //先构建页面，防止产物目录被清理掉
  // target为all的时候不允许watch，只能分别启动两个进程
  if (target === "page" || target === "all") {
    await build_page(args);
  }

  if (target === "module" || target === "all") {
    await build_lib(args);
  }
}
