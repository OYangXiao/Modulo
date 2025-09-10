import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { debug_mode, dir_name_config, src_dir, ui_lib_name } from './settings';

export const module_kinds = ['pages', 'components', 'functions'] as const;

export const collected_modules = Object.fromEntries(
  module_kinds.map((kind) => {
    const module_dir = resolve(src_dir, dir_name_config[kind]);
    if (debug_mode) {
      console.log('checking module dir', module_dir, existsSync(module_dir) ? 'exists' : 'NOT exists')
    }
    // 解析目录下的所有模块
    const module_entries = !existsSync(module_dir)
      ? []
      : readdirSync(module_dir, { withFileTypes: true })
        .filter((item) => {
          if(debug_mode) console.log('checking module is directory', item.name, item.isDirectory())
          return item.isDirectory()
        })
        // 每个模块都要求以index或者main或者文件夹同名命名
        .map((dirent) => {
          const dir_path = resolve(module_dir, dirent.name);
          if (debug_mode) console.log('checking module dir path', dir_path)
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
            ...(ui_lib_name === 'vue'
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
            if (debug_mode) console.log('checking entry path', path)
            return existsSync(path)
          });
          return [dirent.name, entry_file_path];
        })
        // 没有找到入口的就不管
        .filter((entry): entry is [string, string] => !!entry[1]);

    return [
      kind,
      module_entries.length > 0
        ? Object.fromEntries(module_entries)
        : undefined,
    ];
  }),
) as unknown as {
    [key in (typeof module_kinds)[number]]:
    | { [module_name: string]: string }
    | undefined;
  };
