import { lib_pack } from '../packer/lib.ts';
import { page_pack } from '../packer/page.ts';

export async function pack_code(cmd: 'dev' | 'build') {
  //先构建页面，防止产物目录被清理掉
  await page_pack(cmd);
  // await lib_pack(cmd);
}
