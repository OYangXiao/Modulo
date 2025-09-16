import { resolve } from "node:path";
import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import picocolors from "picocolors";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { get_global_config, get_packagejson } from "../config/index.ts";
import { collect_modules } from "../tools/collect-modules.ts";
import { get_externals_and_tags } from "../tools/get-externals-and-tags.ts";
import { framework_plugin } from "../tools/get-ui-plugin.ts";
import { omit_root_path_for_entries } from "../tools/omit-root-path.ts";

export async function lib_pack(args: ModuloArgs_Pack) {
  const config = get_global_config(args);
  const packagejson = get_packagejson();

  console.log(picocolors.blueBright("\n**** 开始构建 【module】 ****\n"));

  const module_entries = collect_modules(args, "modules");

  if (!module_entries) {
    return console.log(picocolors.red("\n没有要构建的模块，跳过\n"));
  } else {
    console.log(
      `${picocolors.blue("\nmodule entries:")}\n${JSON.stringify(
        omit_root_path_for_entries(module_entries),
        null,
        2
      )}\n`
    );
  }

  const { externals } = get_externals_and_tags(args, config.externals);

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
      entry: module_entries,
    },
  });

  await build(rslibConfig, { watch: args.cmd === "build" && args.pack.watch });

  if (args.cmd === "build") {
    console.log(picocolors.green("\n**** 构建【module】完成 ****\n"));
  }
}
