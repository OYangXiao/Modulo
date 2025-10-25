import type { ExternalLibs } from "../externals.ts";

// 构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
export const vue2_example_externals: ExternalLibs = {
  vue: {
    // 支持多个importName，以避免import Vue from 'Vue'这种不正规的写法
    importName: ["vue", "Vue"],
    // preset代表初始化配置的时候能够减少无用配置，比如vue的preset会自动过滤只配置vue的externals
    // url可以直接写字符串，则无论哪种打包模式，都使用这个url
    // 也可以分别提供umd和esm的url，则会根据打包模式自动切换
    // 另外还支持dev和prd模式分别提供不同的url
    url: {
      umd: "https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js",
      esm: "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm",
    },
  },
};
export const react17_example_externals: ExternalLibs = {
  react: {
    importName: ["react", "React"],
    url: {
      umd: "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js",
      esm: "https://cdn.jsdelivr.net/npm/react@17.0.2/+esm",
    },
  },
  // 不写importName，则默认使用libName作为importName
  "react-dom": {
    umd: "/packages/common/js/react-17.0.2/umd/react-dom.production.min.js",
    esm: "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/+esm",
  },
  "react/jsx-runtime": {
    umd: "/packages/common/js/react-17.0.2/umd/react-jsx-runtime.js",
    esm: "/packages/common/js/react-17.0.2/esm/react-jsx-runtime.js",
  },
};
export const common_example_externals: ExternalLibs = {
  jquery: "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js",
  rxjs: {
    umd: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/dist/bundles/rxjs.umd.min.js",
    esm: "https://cdn.jsdelivr.net/npm/rxjs@7.8.2/+esm",
  },
};

export const presets = {
  vue2: { ...vue2_example_externals, ...common_example_externals },
  react17: { ...react17_example_externals, ...common_example_externals },
};
