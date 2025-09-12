import { lib_builder } from './lib';
import { page_builder } from './page';

export function pack() {
  //先构建页面，防止产物目录被清理掉
  page_builder();
  lib_builder();
}
