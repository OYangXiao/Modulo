// 在当前目录创建一份json配置文件
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import picocolors from 'picocolors';
import { get_args } from '../args/index.ts';
import { default_config, default_config_file_name } from '../config/default.ts';
import { example_externals } from '../config/defaults/externals.ts';
import type { USER_CONFIG } from '../config/type.ts';

export function create_config_file() {
  const args = get_args().create_config;

  const filename = args.name || default_config_file_name;
  console.log(picocolors.blue('即将创建配置文件'), filename);

  const filepath = resolve(process.cwd(), filename);

  if (existsSync(filepath)) {
    if (args.force) {
      console.log(picocolors.bgRed(picocolors.white('配置文件已存在，将强制覆盖')));
    } else {
      console.log(picocolors.red('配置文件已存在，跳过'));
      return;
    }
  }

  writeFileSync(
    filepath,
    JSON.stringify(
      {
        // 提供一些常用的配置
        dev_server: default_config.dev_server,
        externals: example_externals.filter((item) => item.preset === args.preset || !item.preset),
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
        url: {
          base: '/',
        },
      } as USER_CONFIG,
      null,
      2,
    ),
  );

  console.log(picocolors.green('创建成功'), filepath);
}
