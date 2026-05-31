# Modulo Vue 2.7 示例

本项目是一个使用 Modulo 打包工具构建 Vue 2.7 应用的实际示例。它演示了 Modulo 的核心功能，如入口点配置和外部依赖管理。

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
基于此配置，Modulo 会扫描 `/src/pages` 目录，并找到 `index` 子目录（其中包含一个 `index.ts` 文件），然后自动将其注册为一个名为 `index` 的页面入口。

### 外部依赖 (Externals)

本项目使用 `externals` 功能从 CDN 加载 Vue，以避免将其打包到最终的应用代码中。这对于提升性能和利用浏览器缓存非常理想。

```json
"externals": {
  "vue": {
    "importName": [
      "vue",
      "Vue"
    ],
    "url": {
      "umd": "https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js",
      "esm": "https://cdn.jsdelivr.net/npm/vue@2.7.16/+esm"
    }
  }
}
```

- **`importName`**: 这个数组确保了 `import Vue from 'vue'` 和 `import Vue from 'Vue'` 两种写法都能被正确地视作外部导入。
- **`url`**: 为 `umd` 和 `esm` 两种构建格式提供了不同的 CDN 链接，允许 Modulo 根据构建配置自动选择正确的链接。