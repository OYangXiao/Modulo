import { resolve } from "node:path";
import { createRsbuild, defineConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import picocolors from "picocolors";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { get_global_config } from "../config/index.ts";
import { get_package_root } from "../tools/find-path-root.ts";
import { framework_plugin } from "../tools/get-ui-plugin.ts";
import { pluginUmd } from "@rsbuild/plugin-umd";
import { prepare_config } from "./prepare.ts";

export async function page_pack(args: ModuloArgs_Pack) {
  const config = get_global_config(args);

  const { entries, externals, importmaps_tag } = prepare_config(
    args,
    "page",
    config
  );

  if (!entries) {
    return;
  }

  const rsbuildConfig = defineConfig({
    source: {
      define: config.define,
      entry: entries,
    },
    plugins: [
      framework_plugin(),
      pluginLess(),
      pluginUmd({
        name: "modulo-page",
      }),
    ],
    tools: {
      rspack: {
        experiments: {
          outputModule: args.pack.esm,
        },
      },
      htmlPlugin: true,
    },
    output: {
      assetPrefix: config.url.cdn || config.url.base,
      distPath: {
        root: config.output.dist,
      },
      externals,
      filenameHash: config.output.filenameHash,
      legalComments: "none",
      minify: config.minify,
    },
    html: {
      meta: config.html.meta,
      mountId: config.html.root,
      scriptLoading: args.pack.esm ? "module" : "defer",
      tags: [importmaps_tag, ...config.html.tags],
      template:
        config.html.template ||
        resolve(get_package_root(), "template/index.html"),
      templateParameters: {
        base_prefix: config.url.base,
      },
      title: config.html.title,
    },
    resolve: {
      alias: config.alias,
    },
    server: {
      base: config.url.base,
      open: config.dev_server.open
        ? config.dev_server.open.map(
            (name: string) =>
              config.url.base +
              (name.endsWith("html") ? `/${name}` : `/${name}.html`)
          )
        : false,
      port: config.dev_server.port,
      proxy: config.dev_server.proxy,
    },
    performance: {
      chunkSplit: {
        strategy: "split-by-experience",
      },
    },
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[args.cmd === "dev" ? "startDevServer" : "build"]({
    watch: args.cmd === "build" && args.pack.watch,
  });

  if (args.cmd === "build") {
    console.log(picocolors.green("\n**** 构建【page】完成 ****"));
  }
}
