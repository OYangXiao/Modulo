# Modulo React 17 示例

本项目是一个使用 Modulo 打包工具构建 React 17 应用的实际示例。它演示了 Modulo 的核心功能，如入口点配置、外部依赖管理和路径别名。

## 先决条件

在开始之前，请确保您已经从 Modulo monorepo 的根目录安装了所有依赖项：

```bash
# 从 monorepo 的根目录执行
pnpm install
```

## 运行示例

### 开发模式

要启动开发服务器，请进入当前目录并运行：

```bash
pnpm run dev:page
```

此命令会执行 `modulo dev page`，它将告诉 Modulo：
- 启动开发服务器 (`dev`)。
- 扫描 `src/pages` 目录以查找并运行**所有**页面入口 (`page`)。
- 应用热模块替换 (HMR)，以提供无缝的开发体验。

### 生产构建

要为生产环境构建应用程序，请运行：

```bash
pnpm run build:page
```

此命令会执行 `modulo build page`，它将打包和优化代码，并将最终的静态资源输出到 `dist/` 目录。

## 配置重点 (`modulo.config.json`)

本示例依赖于 Modulo 的**自动入口发现机制**。`input` 配置项告诉 Modulo 在哪里查找页面和模块。

```json
"input": {
  "src": "src",
  "pages": "pages",
  "modules": "modules"
}
```
基于此配置，Modulo 会扫描 `/src/pages` 目录，并找到 `demo` 子目录（其中包含一个 `index.tsx` 文件），然后自动将其注册为一个名为 `demo` 的页面入口。

### 外部依赖 (Externals)

本项目演示了 Modulo 强大的 `externals` 功能，以避免打包常见的库。

```json
"externals": {
  "react": {
    "url": {
      "umd": "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js",
      "esm": "https://cdn.jsdelivr.net/npm/react@17.0.2/+esm"
    }
  },
  "react-dom": {
    "umd": "/packages/common/js/react-17.0.2/umd/react-dom.production.min.js",
    "esm": "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/+esm"
  },
  "react/jsx-runtime": {
    "umd": "/packages/common/js/react-17.0.2/umd/react-jsx-runtime.js",
    "esm": "/packages/common/js/react-17.0.2/esm/react-jsx-runtime.js"
  }
}
```

- **`react`** 从 CDN 加载。
- **`react-dom`** 和 **`react/jsx-runtime`** 从 monorepo 内部的本地路径 (`/packages/common/...`) 加载。

这种混合方法非常适合于从 CDN 加载全局库，同时将本地的共享包也作为外部依赖处理。Modulo 会自动解析这些路径，并将正确的 `<script>` 标签注入到最终的 HTML 文件中。
