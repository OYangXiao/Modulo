import { resolve } from "node:path";
import { createRsbuild, defineConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import picocolors from "picocolors";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { get_global_config } from "../config/index.ts";
import { collect_modules } from "../tools/collect-modules.ts";
import { get_package_root } from "../tools/find-path-root.ts";
import { get_externals_and_tags } from "../tools/get-externals-and-tags.ts";
import { framework_plugin } from "../tools/get-ui-plugin.ts";
import { omit_root_path_for_entries } from "../tools/omit-root-path.ts";
import { externals_to_importmap } from "../tools/externals-to-importmap.ts";

export async function page_pack(args: ModuloArgs_Pack) {
  const config = get_global_config(args);

  console.log(picocolors.blueBright("\n**** 开始构建 【page】 ****"));

  const page_entries = collect_modules(args, "pages");

  console.log(picocolors.blue("\nbase path"), config.url.base);

  if (!page_entries) {
    return console.log(picocolors.red("\n没有要构建的页面，跳过\n"));
  } else {
    console.log(
      `${picocolors.blue("\npage entries:")}\n${JSON.stringify(
        omit_root_path_for_entries(page_entries),
        null,
        2
      )}\n`
    );
  }

  const { externals, htmlTags } = get_externals_and_tags(
    args,
    config.externals
  );

  const rsbuildConfig = defineConfig({
    source: {
      define: config.define,
      entry: page_entries,
    },
    plugins: [framework_plugin(), pluginLess()],
    tools: {
      rspack: {
        experiments: {
          outputModule: args.pack.esm,
        },
      },
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
      tags: [
        ...config.html.tags,
        ...(args.pack.esm
          ? [
              {
                append: false,
                head: true,
                tag: "script",
                attrs: { type: "importmap" },
                children: externals_to_importmap(args, config.externals),
              },
            ]
          : htmlTags),
      ],
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
  });

  const rsbuild = await createRsbuild({ rsbuildConfig });
  await rsbuild[args.cmd === "dev" ? "startDevServer" : "build"]({
    watch: args.cmd === "build" && args.pack.watch,
  });

  if (args.cmd === "build") {
    console.log(picocolors.green("\n**** 构建【page】完成 ****"));
  }
}
