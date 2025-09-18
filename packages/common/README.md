# common 库

`common` 库用于提供一些特殊的或经过定制的外部依赖，以优化 `modulo` 项目的开发和构建体验。

## 包含内容

### `react-17.0.2`

此目录包含了 React 17.0.2 的 UMD 版本文件，主要用于解决以下问题：

1.  **`react-dom` 的 `jsdelivr` 问题**: 发现 `jsdelivr` 提供的 `react-dom` 存在一些兼容性或加载问题，因此在此处提供本地副本以确保稳定性。
2.  **`react-jsx-runtime` 的独立提供**: React 17.0.2 版本不包含独立的 `react-jsx-runtime` 文件。在 `modulo` 打包 React 组件时，如果每个组件都包含一份 `react-jsx-runtime`，会导致打包体积增大。因此，我们在此处单独提供了 `react-jsx-runtime.js`，以便在 SystemJS 环境中作为共享依赖加载，从而有效减少最终的打包体积。

通过将这些常用但有特殊处理需求的库集中在 `common` 中，可以更好地管理外部依赖，并确保 `modulo` 项目的顺畅运行。
