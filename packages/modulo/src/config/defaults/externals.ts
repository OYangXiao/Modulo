export const default_externals = {
  // lib构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
  jquery: 'jQuery',
  react: 'React',
  'react-dom': 'ReactDOM',
  vue: 'Vue',
  'vue-router': 'VueRouter',
} as Record<string, string>;
