import { createRsbuild, defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { framework_plugin } from '../tools/get-ui-lib-plugin';
import { collected_modules } from '../tools/collect-modules';
import { global_config } from '../config';
import { args } from '../args';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

export async function page_builder() {
  console.log('\npage entries: ', collected_modules.pages);
  console.log('\nbase path', global_config.url.base);

  if (!collected_modules.pages) {
    return console.log('没有要构建的页面');
  }

  const rsbuildConfig = defineConfig({
    plugins: [framework_plugin(), pluginLess()],
    resolve: {
      alias: {
        '@': global_config.input.src,
      },
    },
    source: {
      entry: collected_modules.pages,
      define: {
        'import.meta.env.MOUNT_ID': global_config.html.root,
        ...global_config.define,
      },
    },
    output: {
      distPath: {
        root: global_config.output.dist,
      },
      legalComments: 'none',
      assetPrefix: global_config.url.cdn || global_config.url.base,
      minify: global_config.minify && {
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
      mountId: global_config.html.root,
      title: global_config.html.title,
      templateParameters: {
        base_prefix: global_config.url.base,
      },
      meta: global_config.html.meta,
      template: global_config.html.template || resolve(__dirname, '../template.html'),
    },
    server: {
      port: global_config.dev_server.port,
      base: global_config.url.base,
      open: global_config.dev_server.open?.map(
        (name: string) => global_config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`),
      ),
      proxy: global_config.dev_server.proxy,
    },
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[args.cmd === 'dev' ? 'startDevServer' : 'build']();
}
