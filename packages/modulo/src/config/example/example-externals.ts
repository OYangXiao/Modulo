import type { ExternalLibs } from "../externals.ts";

// 构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
export const example_externals: ExternalLibs = {
  vue: {
    // 支持多个importName，以避免import Vue from 'Vue'这种不正规的写法
    importName: ["vue", "Vue"],
    // preset代表初始化配置的时候能够减少无用配置，比如vue的preset会自动过滤只配置vue的externals
    preset: "vue",
    // url可以直接写字符串，则无论哪种打包模式，都使用这个url
    // 也可以分别提供umd和esm的url，则会根据打包模式自动切换
    // 另外还支持dev和prd模式分别提供不同的url
    url: {
      umd: "https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js",
      esm: "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm",
    },
  },
  react: {
    importName: ["react", "React"],
    preset: "react",
    url: {
      umd: "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js",
      esm: "https://cdn.jsdelivr.net/npm/react@17.0.2/+esm",
    },
  },
  "react-dom": {
    // 不写importName，则默认使用libName作为importName
    preset: "react",
    url: {
      umd: "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/index.min.js",
      esm: "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/+esm",
    },
  },
  "react/jsx-runtime": {
    preset: "react",
    url: {
      umd: "/packages/common/js/react-17.0.2/umd/react-jsx-runtime.js",
      esm: "/packages/common/js/react-17.0.2/esm/react-jsx-runtime.js",
    },
  },
  jquery: {
    // global代表不通过importmap加载，直接通过script标签引入，并挂载到window上
    // window上的key名称就是global的值
    // 也可以通过html.tags引入
    // 此处jQuery的写法则可以省略手动编写html.tags的配置
    global: "jQuery",
    url: "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js",
  },
  rxjs: {
    umd: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/dist/bundles/rxjs.umd.min.js",
    esm: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/+esm",
  },
};
