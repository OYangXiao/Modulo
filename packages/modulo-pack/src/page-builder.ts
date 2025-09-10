import { createRsbuild, defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
// import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";

import {
  base_path,
  base_prefix,
  cdn_domain,
  define,
  dev_server_config,
  dist_dir,
  html_mount_id,
  html_title,
  // lib_externals,
  minify,
  src_dir,
} from './settings';
import { get_ui_lib_plugin } from './get-ui-lib-plugin';
import { args } from './args';
import { collected_modules } from './collect-modules';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

export async function page_builder() {
  const ui_plugin = await get_ui_lib_plugin();

  console.log('\npage entries: ', collected_modules.pages);
  console.log('\nbase prefix', base_prefix);
  console.log('\nbase path', base_path);

  if (!collected_modules.pages) {
    return console.log('没有要构建的页面');
  }

  const rsbuildConfig = defineConfig({
    plugins: [ui_plugin(), pluginLess()],
    resolve: {
      alias: {
        '@': src_dir,
      },
    },
    source: {
      entry: collected_modules.pages,
      define: {
        'import.meta.env.MOUNT_ID': html_mount_id,
        ...define
      },
    },
    output: {
      distPath: {
        root: dist_dir,
      },
      legalComments: 'none',
      assetPrefix: cdn_domain + base_path,
      minify: !minify
        ? false
        : {
          js: true,
          jsOptions: {
            minimizerOptions: {
              mangle: true,
              minify: true,
              compress: {
                defaults: false,
                unused: true,
                dead_code: true,
                toplevel: true,
              },
              format: {
                comments: 'some',
                preserve_annotations: true,
                safari10: true,
                semicolons: false,
                ecma: 2015,
              },
            },
          },
        },
      // externals: lib_externals,
    },
    html: {
      mountId: html_mount_id,
      title: html_title,
      templateParameters: {
        base_prefix,
      },
      meta: {
        viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover',
      },
      template: resolve(__dirname, '../template.html'),
    },
    server: {
      port: dev_server_config.port,
      base: base_path,
      open: dev_server_config.open?.map(
        (name: string) => dev_server_config.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`),
      ),
      ...(dev_server_config.proxy ? { proxy: dev_server_config.proxy } : {}),
    },
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[args.action === 'dev' ? 'startDevServer' : 'build']();
}
