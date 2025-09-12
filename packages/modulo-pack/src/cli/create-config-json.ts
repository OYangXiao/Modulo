// 在当前目录创建一份json配置文件
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { default_config_file_name } from '../args';
import { default_config } from '../config/default';

export function create_config_file(name = default_config_file_name) {
  console.log('即将创建配置文件', name);
  writeFileSync(resolve(process.cwd(), name), JSON.stringify(default_config));
}
