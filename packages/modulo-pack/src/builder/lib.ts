import { defineConfig, build } from '@rslib/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { resolve } from 'node:path';
import { framework_plugin } from '../tools/get-ui-lib-plugin';
import { collected_modules } from '../tools/collect-modules';
import { global_config, packagejson } from '../config';
import { args } from '../args';

export async function lib_builder() {
  console.log(
    '\nmodule entries: ',
    collected_modules.modules,
    '\nmodule output minify: ',
    global_config.minify,
    '\nprocess.env.NODE_ENV',
    process.env.NODE_ENV,
  );

  if (!collected_modules.modules) {
    return console.log('没有要构建的模块');
  }

  // 支持导出umd和esm
  const umd_dist_dir = resolve(global_config.output.modules, 'umd');
  // const esm_dist_dir = resolve(dist_dir, `modules/${kind}/esm`);

  const rslibConfig = defineConfig({
    plugins: [framework_plugin(), pluginLess()],
    resolve: {
      alias: {
        '@': global_config.input.src,
      },
    },
    source: {
      entry: collected_modules.modules,
      define: global_config.define,
    },
    lib: [
      // {
      //   format: 'esm',
      //   syntax: 'esnext',
      //   dts: false,
      //   output: {
      //     externals: lib_externals,
      //     distPath: {
      //       root: esm_dist_dir,
      //     },
      //   },
      // },
      {
        format: 'umd',
        umdName: `${packagejson.name}-modules-[name]`,
        syntax: 'es6',
        output: {
          externals: global_config.externals,
          distPath: {
            root: umd_dist_dir,
          },
          assetPrefix: `${global_config.url.base}/modules/umd`,
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
        },
      },
    ],
    output: {
      target: 'web',
      legalComments: 'none',
      // cssModules: {
      //   exportGlobals: true,
      // },
    },
    performance: {
      bundleAnalyze: global_config.analyze
        ? {
            analyzerMode: 'disabled',
            generateStatsFile: true,
          }
        : undefined,
      chunkSplit: {
        strategy: 'all-in-one',
      },
    },
  });

  await build(rslibConfig, { watch: args.cmd === 'dev' });
}
