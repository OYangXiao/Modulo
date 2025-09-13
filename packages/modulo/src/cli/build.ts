import { lib_builder } from '../builder/lib';
import { page_builder } from '../builder/page';

export function build(cmd: 'dev' | 'build') {
  //先构建页面，防止产物目录被清理掉
  page_builder(cmd);
  lib_builder(cmd);
}
