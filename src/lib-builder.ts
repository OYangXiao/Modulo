import { defineConfig, build } from "@rslib/core";
import { pluginLess } from "@rsbuild/plugin-less";

import { get_ui_lib_plugin } from "./get-ui-lib-plugin";
import { args } from "./args";
import { collected_modules } from "./collect-modules";
import {
  base_path,
  define,
  dist_dir,
  enable_bundle_analyze,
  lib_externals,
  minify,
  packagejson,
  src_dir,
} from "./settings";
import { resolve } from "node:path";

export async function lib_builder() {
  for (const kind of ["components", "functions"] as const) {
    const ui_plugin = await get_ui_lib_plugin();

    console.log(
      `\n${kind} module entries: `,
      collected_modules[kind],
      "\nmodule output minify: ",
      minify,
      "\nprocess.env.NODE_ENV",
      process.env.NODE_ENV
    );

    if (!collected_modules[kind]) {
      return console.log(
        `没有要构建的${kind === "components" ? "组件" : "函数"}模块`
      );
    }

    const umd_dist_dir = resolve(dist_dir, `modules/${kind}/umd`);
    // const esm_dist_dir = resolve(dist_dir, `modules/${kind}/esm`);

    const rslibConfig = defineConfig({
      plugins: [ui_plugin(), pluginLess()],
      resolve: {
        alias: {
          "@": src_dir,
        },
      },
      source: {
        entry: collected_modules[kind],
        define,
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
          format: "umd",
          umdName: `${packagejson.name}-modules-${kind}-[name]`,
          syntax: "es6",
          output: {
            externals: lib_externals,
            distPath: {
              root: umd_dist_dir,
            },
            assetPrefix: `${base_path}/modules/${kind}/umd`,
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
                        comments: "some",
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
        target: "web",
        legalComments: "none",
        cssModules: {
          exportGlobals: true,
        },
      },
      performance: {
        bundleAnalyze: enable_bundle_analyze
          ? {
              analyzerMode: "disabled",
              generateStatsFile: true,
            }
          : undefined,
        chunkSplit: {
          strategy: "all-in-one",
        },
      },
    });

    await build(rslibConfig, { watch: args.action === "dev" });
  }
}
