import { resolve } from "node:path";
import { pluginLess } from "@rsbuild/plugin-less";
import { build, defineConfig } from "@rslib/core";
import picocolors from "picocolors";
import { get_global_config, get_packagejson } from "../config/index.ts";
import { collect_modules } from "../tools/collect-modules.ts";
import { get_externals_and_tags } from "../tools/get-externals-and-tags.ts";
import { framework_plugin } from "../tools/get-ui-plugin.ts";

export async function lib_pack(cmd: "dev" | "build") {
  const config = get_global_config();
  const packagejson = get_packagejson();

  console.log(picocolors.blueBright("\n**** 开始构建 【module】 ****\n"));

  const module_entries = collect_modules("modules");

  console.log(picocolors.blue("\nmodule entries: "), module_entries);

  if (!module_entries) {
    return console.log(picocolors.red("\n没有要构建的模块，跳过"));
  }

  const { externals } = get_externals_and_tags(config.externals);

  // 支持导出umd和esm
  const umd_dist_dir = resolve(config.output.modules, "umd");
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
      alias: {
        "@": config.input.src,
      },
    },
    source: {
      define: config.define,
      entry: module_entries,
    },
  });

  await build(rslibConfig, { watch: cmd === "dev" });

  if (cmd === "build") {
    console.log(picocolors.green("\n**** 构建【module】完成 ****\n"));
  }
}
