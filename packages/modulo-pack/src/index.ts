import { args } from './args';
import { lib_builder } from './lib-builder';
import { page_builder } from './page-builder';

if (args.target === 'page' || args.target === 'all') {
  //先构建页面，防止产物目录被清理掉
  page_builder();
}

if (args.target === 'lib' || args.target === 'all') {
  lib_builder();
}
