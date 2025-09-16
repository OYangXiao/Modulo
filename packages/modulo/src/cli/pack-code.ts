import type { ModuloArgs_Pack } from "../args/index.ts";
import { lib_pack } from "../packer/lib.ts";
import { page_pack } from "../packer/page.ts";

export async function pack_code(args: ModuloArgs_Pack) {
  const { target } = args;

  //先构建页面，防止产物目录被清理掉
  // target为all的时候不允许watch，只能分别启动两个进程
  if (target === "page" || target === "all") {
    await page_pack(args);
  }

  if (target === "module" || target === "all") {
    await lib_pack(args);
  }
}
