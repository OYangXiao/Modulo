import { resolve } from 'node:path';
import { createRsbuild, defineConfig } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import picocolors from 'picocolors';
import { get_global_config } from '../config/index.ts';
import { collect_modules } from '../tools/collect-modules.ts';
import { get_package_root } from '../tools/find-path-root.ts';
import { get_externals_and_tags } from '../tools/get-externals-and-tags.ts';
import { framework_plugin } from '../tools/get-ui-plugin.ts';

export async function page_pack(cmd: 'dev' | 'build') {
  const config = get_global_config();

  console.log(picocolors.blueBright('\n**** 开始构建 【page】 ****'));

  const page_entries = collect_modules('pages');

  console.log(picocolors.blue('\n\npage entries: '), page_entries, picocolors.blue('\nbase path'), config.url.base);

  if (!page_entries) {
    return console.log(picocolors.red('\n没有要构建的页面，跳过'));
  }

  const { externals, htmlTags } = get_externals_and_tags(config.externals);

  const rsbuildConfig = defineConfig({
    html: {
      meta: config.html.meta,
      mountId: config.html.root,
      tags: [...htmlTags, ...config.html.tags],
      template: config.html.template || resolve(get_package_root(), 'template/index.html'),
      templateParameters: {
        base_prefix: config.url.base,
      },
      title: config.html.title,
    },
    output: {
      assetPrefix: config.url.cdn || config.url.base,
      distPath: {
        root: config.output.dist,
      },
      externals,
      filenameHash: config.output.filenameHash,
      legalComments: 'none',
      minify: config.minify && {
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
    },
    plugins: [framework_plugin(), pluginLess()],
    resolve: {
      alias: {
        '@': config.input.src,
      },
    },
    server: {
      base: config.url.base,
      open: config.dev_server.open
        ? config.dev_server.open.map(
            (name: string) => config.url.base + (name.endsWith('html') ? `/${name}` : `/${name}.html`),
          )
        : false,
      port: config.dev_server.port,
      proxy: config.dev_server.proxy,
    },
    source: {
      define: {
        'import.meta.env.MOUNT_ID': config.html.root,
        ...config.define,
      },
      entry: page_entries,
    },
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[cmd === 'dev' ? 'startDevServer' : 'build']();

  if (cmd === 'build') {
    console.log(picocolors.green('\n**** 构建【page】完成 ****'));
  }
}
