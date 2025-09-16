import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      dts: false,
      format: "esm",
      syntax: "esnext",
      output: {
        filename: {
          js: "webhost.[name].js",
        },
      },
    },
    // {
    //   dts: false,
    //   format: "iife",
    //   syntax: "esnext",
    //   output: {
    //     filename: {
    //       js: "webhost.[name].js",
    //     },
    //   },
    // },
  ],
  output: {
    distPath: {
      root: "./dist",
    },
    target: "node",
  },
  source: {
    entry: {
      esm: "./src/esm.ts",
      iife: "./src/iife.ts",
    },
  },
});
