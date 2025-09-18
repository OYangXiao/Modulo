# Webhost

`webhost` 是一个基础库，旨在促进在 SystemJS 环境中模块化加载各种 JavaScript 框架，包括 React 和 Vue。它提供了动态加载和挂载组件的实用函数，从而实现灵活可扩展的微前端或基于模块的架构。

## 特性

-   **SystemJS 集成**: 利用 SystemJS 进行动态模块加载。
-   **React 模块加载**: 提供加载 React 模块和挂载 React 组件的函数。
-   **Vue 模块加载**: 提供加载 Vue 模块和挂载 Vue 组件的函数。

## 用法

要使用 `webhost`，请在其 HTML 中包含编译后的 `webhost.system.js` 文件。确保 SystemJS 和导入映射已配置为解析您的依赖项（例如，`react`、`react-dom`、`vue`）。

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
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
  <div id="vue-app"></div>
  <script>
    async function init(){
      // webhost 函数现在通过 window.webhost 全局暴露
      // 无需在此处直接从 SystemJS 导入它们。

      // 示例：加载和挂载 React 组件
      await window.webhost.loadModule('/path/to/your/react-module.js', '#react-app', 'react');

      // 示例：加载和挂载 Vue 组件
      await window.webhost.loadModule('/path/to/your/vue-module.js', '#vue-app', 'vue');
    }
    init();
  </script>
</body>
</html>
```

## API

### `window.webhost.loadModule(modulePath: string, selector: string, frameworkType?: 'react' | 'vue'): Promise<void>`
加载并将模块（React 或 Vue）挂载到指定的 DOM 元素。
根据模块内容或提供的提示自动检测框架类型。

-   `modulePath`: 要加载的模块的路径（例如，`'/packages/react-17.0.2/dist/modules/umd/counter.js'`）。
-   `selector`: 组件将挂载到的 DOM 元素的 CSS 选择器（例如，`'#react-app'`）。
-   `frameworkType` (可选): 明确指定 `'react'` 或 `'vue'` 以绕过自动检测。