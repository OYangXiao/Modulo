import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      dts: false,
      format: 'esm',
      syntax: 'esnext',
    },
  ],
  output: {
    distPath: {
      root: './dist',
    },
    target: 'node',
  },
  source: {
    entry: {
      create_config: './src/cli/create-config-json.ts',
      index: './src/index.ts',
    },
  },
});
