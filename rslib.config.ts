import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
      'lib-builder': './src/lib-builder.ts',
      'page-builder': './src/page-builder.ts',
    },
  },
  lib: [
    {
      format: 'esm',
      syntax: 'esnext',
      dts: false,
    },
  ],
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
  },
});
