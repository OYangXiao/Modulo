import type { ModuloArgs_Pack } from "../args/index.ts";
import { lib_pack } from "../packer/lib.ts";
import { page_pack } from "../packer/page.ts";

export async function pack_code(args: ModuloArgs_Pack) {
  const { target } = args;

  if (args.cmd === "preview") {
    await page_pack(args);
    return;
  }

  //先构建页面，防止产物目录被清理掉
  // target为all的时候不允许watch，只能分别启动两个进程
  // 针对 dev 模式优化：并行启动 page 和 module
  if (target === "all" && args.cmd === "dev") {
    await Promise.all([page_pack(args), lib_pack(args)]);
    return;
  }

  if (target === "page" || target === "all") {
    await page_pack(args);
  }

  if (target === "module" || target === "all") {
    await lib_pack(args);
  }
}
