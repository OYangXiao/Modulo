import { lib_builder } from './builder/lib';
import { page_builder } from './builder/page';

//先构建页面，防止产物目录被清理掉
page_builder();
lib_builder();
