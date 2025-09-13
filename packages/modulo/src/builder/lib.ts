import { resolve } from 'node:path';
import { pluginLess } from '@rsbuild/plugin-less';
import { build, defineConfig } from '@rslib/core';
import { get_global_config, packagejson } from '../config';
import { collect_modules } from '../tools/collect-modules';
import { framework_plugin } from '../tools/get-ui-lib-plugin';

export async function lib_builder(cmd: 'dev' | 'build') {
  const global_config = get_global_config();
  const collected_modules = collect_modules();

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
        output: {
          assetPrefix: `${global_config.url.base}/modules/umd`,
          distPath: {
            root: umd_dist_dir,
          },
          externals: global_config.externals,
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
        },
        syntax: 'es6',
        umdName: `${packagejson.name}-modules-[name]`,
      },
    ],
    output: {
      legalComments: 'none',
      target: 'web',
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
    plugins: [framework_plugin(), pluginLess()],
    resolve: {
      alias: {
        '@': global_config.input.src,
      },
    },
    source: {
      define: global_config.define,
      entry: collected_modules.modules,
    },
  });

  await build(rslibConfig, { watch: cmd === 'dev' });
}
