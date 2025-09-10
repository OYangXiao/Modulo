import { args } from './args';

if (args.target === 'page' || args.target === 'all') {
  //先构建页面，防止产物目录被清理掉
  (await import('./page-builder')).page_builder();
}

if (args.target === 'lib' || args.target === 'all') {
  (await import('./lib-builder')).lib_builder();
}
