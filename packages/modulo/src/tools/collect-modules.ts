import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { get_global_config } from '../config';
import { framework_name } from './get-ui-lib-plugin';
import { write_log } from './write-log';

export const module_kinds = ['pages', 'modules'] as const;

export function collect_modules() {
  const global_config = get_global_config();
  return Object.fromEntries(
    module_kinds.map((kind) => {
      const module_path = global_config.input[kind];
      const exist = existsSync(module_path);
      write_log('check module_path', module_path, exist ? 'exists' : 'NOT exists');
      // 解析目录下的所有模块
      const module_entries = !exist
        ? []
        : readdirSync(module_path, { withFileTypes: true })
            .filter((item) => {
              write_log('checking module is directory', item.name, item.isDirectory());
              return item.isDirectory();
            })
            // 每个模块都要求以index或者main或者文件夹同名命名
            .map((dirent) => {
              const dir_path = resolve(module_path, dirent.name);
              write_log('checking module dir path', dir_path);
              const entry_file_path = [
                resolve(dir_path, 'index.ts'),
                resolve(dir_path, 'index.tsx'),
                resolve(dir_path, 'index.js'),
                resolve(dir_path, 'index.jsx'),
                resolve(dir_path, 'main.ts'),
                resolve(dir_path, 'main.tsx'),
                resolve(dir_path, 'main.js'),
                resolve(dir_path, 'main.jsx'),
                // vue组件常常用vue文件作为入口，因此优先级高于同名ts和tsx文件
                ...(framework_name === 'vue'
                  ? [
                      resolve(dir_path, 'index.vue'),
                      resolve(dir_path, 'main.vue'),
                      resolve(dir_path, `${dirent.name}.vue`),
                    ]
                  : []),
                resolve(dir_path, `${dirent.name}.ts`),
                resolve(dir_path, `${dirent.name}.tsx`),
                resolve(dir_path, `${dirent.name}.js`),
                resolve(dir_path, `${dirent.name}.jsx`),
              ].find((path) => {
                write_log('checking entry path', path);
                return existsSync(path);
              });
              return [dirent.name, entry_file_path];
            })
            // 没有找到入口的就不管
            .filter((entry): entry is [string, string] => !!entry[1]);

      return [kind, module_entries.length > 0 ? Object.fromEntries(module_entries) : undefined];
    }),
  ) as unknown as {
    [key in (typeof module_kinds)[number]]: { [module_name: string]: string } | undefined;
  };
}
