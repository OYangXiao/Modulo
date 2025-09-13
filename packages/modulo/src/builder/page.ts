import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild, defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import picocolors from 'picocolors';
import { get_global_config } from '../config';
import { collect_modules } from '../tools/collect-modules';
import { framework_plugin } from '../tools/get-ui-lib-plugin';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

export async function page_builder(cmd: 'dev' | 'build') {
  const global_config = get_global_config();
  const collected_modules = collect_modules();

  console.log('\npage entries: ', collected_modules.pages);
  console.log('\nbase path', global_config.url.base);

  if (!collected_modules.pages) {
    return console.log(picocolors.yellow('\n没有要构建的页面'));
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
      open: global_config.dev_server.open?.map(
        (name: string) => global_config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`),
      ),
      port: global_config.dev_server.port,
      proxy: global_config.dev_server.proxy,
    },
    source: {
      define: {
        'import.meta.env.MOUNT_ID': global_config.html.root,
        ...global_config.define,
      },
      entry: collected_modules.pages,
    },
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[cmd === 'dev' ? 'startDevServer' : 'build']();
}
