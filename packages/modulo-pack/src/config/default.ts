export const default_config = {
  input: {
    src: 'src', // 源码目录
    pages: 'pages', // 页面目录
    modules: 'modules', // 组件目录
  },
  output: {
    dist: 'dist', // 源码目录
    pages: '', // 页面目录输出目录，默认使用dist/..
    modules: 'modules', // 组件输出目录，默认使用dist/modules/..
  },
  html: {
    root: 'app', // html挂载点id, 只允许id
    title: '', //
    meta: {
      viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover',
    },
    template: '',
  },
  url: {
    base: '', // 前缀路径
    cdn: '', // 可以将除了html资源以外的资源都部署到cdn上，比如https://cdn.host.com/，或者https://cdn.host.com/cdn-path/
  },
  dev_server: {
    port: 8080, // 开发页面时, dev-server服务器端口
    open: undefined as undefined | string[], // dev时是否自动打开指定页面
    proxy: {} as Dict<string | { target: string; pathRewrite?: Dict }>, // dev时的代理配置
  },
  // lib构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    vue: 'Vue',
    'vue-router': 'VueRouter',
    jquery: 'jQuery',
  },
  // 对ui库做严格的版本限制，以提高统一程度
  ui_lib: {
    vue: '2.7.16',
    react: '17.0.2',
  },
  minify: undefined, // 是否压缩产物，同时进行mangle
  analyze: false, // 是否执行bundleAnalyze
  define: {} as Dict,
};

export type USER_CONFIG = typeof default_config;
