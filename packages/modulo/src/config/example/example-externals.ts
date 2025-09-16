interface _ExternalUrl {
  umd?: string;
  esm?: string;
}

type ExternalUrl = _ExternalUrl | string;

export interface LibExternal {
  url?: ExternalUrl | { dev?: ExternalUrl; prd?: ExternalUrl };
  global: string;
  importName: string | string[];
  publicPath: boolean;
  name: string;
  preset?: string;
}
// 构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
export const example_externals: LibExternal[] = [
  {
    global: "Vue",
    importName: ["vue", "Vue"],
    name: "vue",
    preset: "vue",
    publicPath: false,
    url: "https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js",
  },
  {
    global: "React",
    importName: ["react", "React"],
    name: "react",
    preset: "react",
    publicPath: false,
    url: {
      umd: "/packages/common/js/react-17.0.2/umd/react-dom.production.js",
      esm: "/packages/common/js/react-17.0.2/esm/react-dom.production.js",
    },
  },
  {
    global: "ReactDOM",
    importName: "react-dom",
    name: "react-dom",
    preset: "react",
    publicPath: false,
    url: {
      umd: "/packages/common/js/react-17.0.2/umd/react-dom.production.js",
      esm: "/packages/common/js/react-17.0.2/esm/react-dom.production.js",
    },
  },
  {
    global: "ReactJsxRuntime",
    importName: "react/jsx-runtime",
    name: "react/jsx-runtime",
    preset: "react",
    publicPath: false,
  },
  {
    global: "jQuery",
    importName: ["jquery", "jQuery"],
    name: "jQuery",
    publicPath: false,
    url: "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
  },
];
