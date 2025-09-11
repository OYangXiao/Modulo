import { global_config, packagejson } from '../config';
import { PANIC_IF } from './panic';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginVue2 } from '@rsbuild/plugin-vue2';

const { dependencies } = packagejson;

PANIC_IF(
  !('vue' in dependencies || 'react' in dependencies),
  'package.json中未识别到支持的ui库信息, 当前只支持vue和react',
);

// 该项目是vue还是react项目
export const framework_name = 'vue' in dependencies ? 'vue' : 'react';

// 必须使用指定版本号的ui库，以优化代码产出
const version = dependencies[framework_name];
PANIC_IF(
  global_config.ui_lib[framework_name] !== version,
  'package.json中只允许使用固定版本号, 并且只支持vue-2.7.16和react-17.0.2',
);

export const framework_plugin = framework_name === 'vue' ? pluginVue2 : pluginReact;
