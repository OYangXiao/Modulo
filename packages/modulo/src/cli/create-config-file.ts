// 在当前目录创建一份json配置文件
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import picocolors from 'picocolors';
import { args } from '../args/index.ts';
import { default_config, default_config_file_name } from '../config/default.ts';
import type { USER_CONFIG } from '../config/type.ts';

export function create_config_file() {
  const filename = args.name || default_config_file_name;
  console.log(picocolors.blue('即将创建配置文件'), filename);

  if (existsSync(filename)) {
    console.log(picocolors.bgRed(picocolors.white('配置文件已存在')));
    return;
  }

  const filepath = resolve(process.cwd(), filename);

  writeFileSync(
    filepath,
    JSON.stringify(
      {
        // 提供一些常用的配置
        dev_server: default_config.dev_server,
        html: {
          title: 'Modulo Page',
        },
        input: {
          modules: default_config.input.modules,
          pages: default_config.input.pages,
        },
        output: {
          filenameHash: true,
        },
      } as USER_CONFIG,
      null,
      2,
    ),
  );

  console.log(picocolors.green('创建成功'), filepath);
}
