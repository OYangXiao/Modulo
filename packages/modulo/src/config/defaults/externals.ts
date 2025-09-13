export interface LibExternal {
  url?: string;
  global: string;
  importName: string | string[];
  publicPath: boolean;
  name: string;
  preset?: string;
}
// 构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
export const example_externals: LibExternal[] = [
  {
    global: 'Vue',
    importName: ['vue', 'Vue'],
    name: 'vue',
    preset: 'vue',
    publicPath: false,
    url: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js',
  },
  {
    global: 'React',
    importName: ['react', 'React'],
    name: 'react',
    preset: 'react',
    publicPath: false,
    url: 'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js',
  },
  {
    global: 'ReactDOM',
    importName: 'react-dom',
    name: 'react-dom',
    preset: 'react',
    publicPath: false,
    url: 'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js',
  },
  {
    global: 'jQuery',
    importName: ['jquery', 'jQuery'],
    name: 'jQuery',
    publicPath: false,
    url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
  },
];
