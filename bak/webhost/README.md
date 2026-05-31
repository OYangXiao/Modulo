# Webhost

`webhost` 是一个基础库，旨在促进在 SystemJS 环境中模块化加载各种 JavaScript 框架，包括 React 和 Vue。它提供了动态加载和挂载组件的实用函数，从而实现灵活可扩展的微前端或基于模块的架构。

## 特性

- **SystemJS 集成**: 利用 SystemJS 进行动态模块加载。
- **React 模块加载**: 提供加载 React 模块和挂载 React 组件的函数。
- **Vue 模块加载**: 提供加载 Vue 模块和挂载 Vue 组件的函数。

## 用法

要使用 `webhost`，请在其 HTML 中包含编译后的 `webhost.system.js` 文件。确保 SystemJS 和导入映射已配置为解析您的依赖项（例如，`react`、`react-dom`、`vue`）。

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <script type="systemjs-importmap">
      {
        "imports": {
          "react": "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js",
          "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js",
          "vue": "https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js"
        }
      }
    </script>
    <script src="/path/to/webhost.system.js"></script>
  </head>
  <body>
    <div id="react-app"></div>
    <div id="vue-bare-app"></div>
    <div id="vue-extended-app"></div>
    <script>
      async function init() {
        // webhost 函数现在通过 window.webhost.remote_module 全局暴露

        // 示例：加载并挂载 React 组件
        window.webhost.remote_module.mount_react({
          path: "/packages/react-17.0.2/dist/modules/umd/counter.js",
          root: "#react-app",
          key: "Counter",
        });

        // 示例：加载并挂载 Vue 裸模块组件
        window.webhost.remote_module.mount_vue2({
          path: "/packages/vue-2.7.16/dist/modules/umd/vue-bare-mod.js",
          root: "#vue-bare-app",
        });

        // 示例：加载并挂载 Vue 扩展模块组件
        window.webhost.remote_module.mount_vue2({
          path: "/packages/vue-2.7.16/dist/modules/umd/vue-extended-mod.js",
          root: "#vue-extended-app",
        });

        // 示例：使用统一的 mount 函数（需要指定类型）
        // await window.webhost.remote_module.mount({
        //   path:'/packages/react-17.0.2/dist/modules/umd/counter.js',
        //   root:'#react-app-unified',
        //   key:'Counter',
        //   type:'react'
        // });
      }
      init();
    </script>
  </body>
</html>
```

## API

### `window.webhost.remote_module.load(path: string, key?: string, key2?: string): Promise<any>`

加载远程模块。

- `path`: 远程模块路径。
- `key` (可选): 模块导出键 (用于访问特定命名导出)。
- `key2` (可选): 模块二级导出键 (用于访问嵌套命名导出，例如 Vue 模块的 default.default)。
- 返回一个 Promise，该 Promise 解析为模块导出值。

### `window.webhost.remote_module.mount(params: { path: string; root: HTMLElement | string; key?: string; props?: any; type: "react" | "vue2"; }): Promise<any>`

加载并将模块（React 或 Vue）挂载到指定的 DOM 元素。

- `type`: 明确指定 `"react"` 或 `"vue2"`。
  - `params`: 包含以下属性的对象：
  - `path`: 要加载的模块的路径。
  - `root`: 组件将挂载到的 DOM 元素的 HTMLElement 实例或 CSS 选择器字符串。
  - `key` (可选): 模块导出键 (仅适用于 React)。
  - `props` (可选): 传递给组件的 props。

### `window.webhost.remote_module.mount_react(params: { path: string; root: HTMLElement | string; key?: string; props?: any; }): Promise<any>`

加载并将 React 模块挂载到指定的 DOM 元素。

- `params`: 包含以下属性的对象：
  - `path`: 要加载的 React 模块的路径。
  - `root`: 组件将挂载到的 DOM 元素的 HTMLElement 实例或 CSS 选择器字符串。
  - `key` (可选): 模块导出键。
  - `props` (可选): 传递给组件的 props。

### `window.webhost.remote_module.mount_vue2(params: { path: string; root: HTMLElement | string; props?: any; }): Promise<any>`

加载并将 Vue 2 模块挂载到指定的 DOM 元素。

- `params`: 包含以下属性的对象：
  - `path`: 要加载的 Vue 2 模块的路径。
  - `root`: 组件将挂载到的 DOM 元素的 HTMLElement 实例或 CSS 选择器字符串。
  - `props` (可选): 传递给组件的 props。
