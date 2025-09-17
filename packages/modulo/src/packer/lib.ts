import { resolve } from "node:path";
import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import picocolors from "picocolors";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { get_global_config, get_packagejson } from "../config/index.ts";
import { framework_plugin } from "../tools/get-ui-plugin.ts";
import { prepare_config } from "./prepare.ts";

export async function lib_pack(args: ModuloArgs_Pack) {
  const config = get_global_config(args);
  const packagejson = get_packagejson();

  const { entries, externals } = prepare_config(args, "module", config);

  if (!entries) {
    return;
  }

  // 支持导出umd和esm
  const umd_dist_dir = resolve(config.output.modules, "umd");
  const esm_dist_dir = resolve(config.output.modules, "esm");

  const rslibConfig = defineConfig({
    lib: [
      {
        format: "esm",
        syntax: "esnext",
        dts: false,
        output: {
          externals,
          distPath: {
            root: esm_dist_dir,
          },
          minify: config.minify,
        },
      },
      {
        format: "umd",
        output: {
          assetPrefix: `${config.url.base}/modules/umd`,
          distPath: {
            root: umd_dist_dir,
          },
          externals,
          minify: config.minify,
        },
        syntax: "es6",
        umdName: `${packagejson.name}-modules-[name]`,
      },
    ],
    output: {
      legalComments: "none",
      target: "web",
      // cssModules: {
      //   exportGlobals: true,
      // },
    },
    performance: {
      bundleAnalyze: config.analyze
        ? {
            analyzerMode: "disabled",
            generateStatsFile: true,
          }
        : undefined,
      chunkSplit: {
        strategy: "all-in-one",
      },
    },
    plugins: [framework_plugin(), pluginLess()],
    resolve: {
      alias: config.alias,
    },
    source: {
      define: config.define,
      entry: entries,
    },
  });

  await build(rslibConfig, { watch: args.cmd === "build" && args.pack.watch });

  if (args.cmd === "build") {
    console.log(picocolors.green("\n**** 构建【module】完成 ****\n"));
  }
}
