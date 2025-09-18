import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    // {
    //   dts: false,
    //   format: "esm",
    //   syntax: "esnext",
    //   output: {
    //     filename: {
    //       js: "webhost.[name].js",
    //     },
    //     minify: true,
    //   },
    // },
    {
      dts: false,
      format: "iife",
      syntax: "esnext",
      output: {
        filename: {
          js: "webhost.[name].js",
        },
        minify: true,
      },
    },
  ],
  output: {
    distPath: {
      root: "./dist",
    },
    target: "node",
  },
  source: {
    entry: {
      module: "./src/webhost-module.ts",
      system: "./src/webhost-system.ts",
    },
  },
});
