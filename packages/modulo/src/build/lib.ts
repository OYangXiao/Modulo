import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import picocolors from "picocolors";
import type { Modulo_Build_Args } from "../cli/args/resolve.ts";
import { get_global_config, get_packagejson } from "./config/index.ts";
import { framework_plugin } from "./get-ui-plugin.ts";
import { prepare_config } from "./prepare.ts";

export async function build_lib(args: Modulo_Build_Args) {
  const config = get_global_config(args);
  const packagejson = get_packagejson();

  const { entries, externals } = prepare_config(args, "module", config);

  if (!entries) {
    return;
  }

  const rslibConfig = defineConfig({
    source: {
      define: config.define,
      entry: entries,
    },
    plugins: [framework_plugin(args), pluginLess()],
    resolve: {
      alias: config.alias,
    },
    lib: [
      {
        format: "esm",
        syntax: "esnext",
        dts: false,
        output: {
          assetPrefix: `${config.url.base}/modules`,
          externals,
          distPath: {
            root: config.output.modules,
            js: "esm",
            jsAsync: "esm",
            css: "esm",
          },
          minify: config.minify,
        },
      },
      {
        format: "umd",
        output: {
          assetPrefix: `${config.url.base}/modules`,
          externals,
          distPath: {
            root: config.output.modules,
            js: "umd",
            jsAsync: "umd",
            css: "umd",
          },
          minify: config.minify,
        },
        syntax: "es6",
        umdName: `${packagejson.name}-modules-[name]`,
      },
    ],
    output: {
      legalComments: "none",
      target: "web",
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
  });

  await build(rslibConfig, { watch: args.cmd === "build" && args.build.watch });

  if (args.cmd === "build") {
    console.log(picocolors.green("\n**** 构建【module】完成 ****\n"));
  }
}
