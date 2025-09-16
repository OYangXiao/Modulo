import { get_packagejson } from '../config/index.ts';
import { PANIC_IF } from './panic.ts';

let framework_name: 'vue' | 'react';
export function get_framework_name() {
  if (!framework_name) {
    const { dependencies } = get_packagejson();

    PANIC_IF(
      !('vue' in dependencies || 'react' in dependencies),
      'package.json中未识别到支持的ui库信息, 当前只支持vue和react',
    );

    // 该项目是vue还是react项目
    framework_name = 'vue' in dependencies ? 'vue' : 'react';
  }
  return framework_name;
}
