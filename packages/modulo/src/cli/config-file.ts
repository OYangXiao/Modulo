// 在当前目录创建一份json配置文件
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { args } from '../args';
import { default_config, default_config_file_name } from '../config/default';

export function create_config_file() {
  const filename = args.name || default_config_file_name;
  console.log('即将创建配置文件', filename);
  writeFileSync(resolve(process.cwd(), filename), JSON.stringify(default_config, null, 2));
}
