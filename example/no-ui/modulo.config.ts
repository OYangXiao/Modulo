import { defineConfig } from '@yannick-z/modulo';

export default defineConfig({
  input: {
    src: 'src',
    pages: 'pages',
    modules: 'modules',
    entries: {},
  },
  output: {
    filenameHash: true,
    distPath: 'dist',
    pages: '',
    modules: 'modules',
  },
  url: {
    base: '/',
    cdn: '',
  },
  alias: {
    '@': '{input.src}',
  },
  autoExternal: true,
  externalsType: 'script',
  html: {
    root: 'app',
    title: '',
    template: '',
    meta: {},
    tags: [],
  },
  dev_server: {
    open: false,
    port: 8080,
    proxy: {},
  },
  externals: {},
});
