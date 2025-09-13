import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild, defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import picocolors from 'picocolors';
import { get_global_config } from '../config/index.ts';
import { collect_modules } from '../tools/collect-modules.ts';
import { framework_plugin } from '../tools/get-ui-lib-plugin.ts';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

export async function page_pack(cmd: 'dev' | 'build') {
  const global_config = get_global_config();

  console.log(picocolors.blueBright('\n**** 开始构建 【page】 ****'));

  const page_entries = collect_modules('pages');

  console.log(
    picocolors.blue('\n\npage entries: '),
    page_entries,
    picocolors.blue('\nbase path'),
    global_config.url.base,
  );

  if (!page_entries) {
    return console.log(picocolors.red('\n没有要构建的页面，跳过'));
  }

  const rsbuildConfig = defineConfig({
    html: {
      meta: global_config.html.meta,
      mountId: global_config.html.root,
      template: global_config.html.template || resolve(__dirname, '../template.html'),
      templateParameters: {
        base_prefix: global_config.url.base,
      },
      title: global_config.html.title,
    },
    output: {
      assetPrefix: global_config.url.cdn || global_config.url.base,
      distPath: {
        root: global_config.output.dist,
      },
      filenameHash: global_config.output.filenameHash,
      legalComments: 'none',
      minify: global_config.minify && {
        js: true,
        jsOptions: {
          minimizerOptions: {
            compress: {
              dead_code: true,
              defaults: false,
              toplevel: true,
              unused: true,
            },
            format: {
              comments: 'some',
              ecma: 2015,
              preserve_annotations: true,
              safari10: true,
              semicolons: false,
            },
            mangle: true,
            minify: true,
          },
        },
      },
      // externals: lib_externals,
    },
    plugins: [framework_plugin(), pluginLess()],
    resolve: {
      alias: {
        '@': global_config.input.src,
      },
    },
    server: {
      base: global_config.url.base,
      open: global_config.dev_server.open
        ? global_config.dev_server.open.map(
            (name: string) => global_config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`),
          )
        : false,
      port: global_config.dev_server.port,
      proxy: global_config.dev_server.proxy,
    },
    source: {
      define: {
        'import.meta.env.MOUNT_ID': global_config.html.root,
        ...global_config.define,
      },
      entry: page_entries,
    },
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[cmd === 'dev' ? 'startDevServer' : 'build']();
}
