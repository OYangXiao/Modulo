# Modulo

Modulo 是一个基于 [Rspack](https://www.rspack.dev/) 的高性能前端构建工具，旨在简化 Web 应用和第三方库的开发与打包流程。

## ✨ 特性

- **🚀 高性能**：基于 Rust 开发的 Rspack，享受极速的构建和热更新体验。
- **🎯 双模式打包**：不仅可以打包 Web 应用 (`page`)，还支持打包 JavaScript 库 (`module`)。
- **🧩 框架支持**：为 `React` 和 `Vue` 提供开箱即用的预设配置，简化项目初始化。
- **⚙️ 简化配置**：通过清晰直观的 `modulo.config.json` 文件管理项目配置。
- **🛠️ 开发友好**：内置开发服务器，支持热更新，并提供简单易用的命令行工具。

## 📦 安装

```bash
npm install -g @yannick-z/modulo
```

## 🚀 快速开始

1.  **初始化项目**

    在你的项目根目录下执行：
    ```bash
    modulo init
    ```
    该命令会自动创建 `modulo.config.json` 配置文件，并向 `package.json` 中添加 `dev` 和 `build` 脚本。

    如果你的项目使用 React 或 Vue，可以添加 `--preset` 参数：
    ```bash
    # 初始化 React 项目
    modulo init --preset=react

    # 初始化 Vue 项目
    modulo init --preset=vue
    ```

2.  **启动开发服务**

    ```bash
    npm run dev
    ```
    这会启动一个本地开发服务器，并开启热更新功能。

3.  **构建生产产物**

    ```bash
    npm run build
    ```
    该命令会为生产环境打包和压缩代码。

## 命令行 (CLI)

- ### `modulo init`

  初始化项目，创建配置文件并添加 npm 脚本。

  **选项:**
  - `--target=config`: 仅创建 `modulo.config.json` 文件。
  - `--target=script`: 仅在 `package.json` 中添加脚本。
  - `--preset=<react|vue>`: 使用指定框架的预设配置进行初始化。

- ### `modulo dev`

  启动开发服务器，用于页面开发，默认启用热更新。

  **选项:**
  - `--target=page`: (默认) 用于开发 Web 应用。
  - `--target=module`: 用于开发 JS 库，会进入监听模式。

- ### `modulo build`

  执行生产环境构建。

  **选项:**
  - `--target=page`: (默认) 构建 Web 应用。
  - `--target=module`: 构建 JS 库。
  - `--target=all`: 同时构建 Web 应用和 JS 库。

## 配置文件 (`modulo.config.json`)

项目的所有配置都集中在根目录的 `modulo.config.json` 文件中。以下是一个包含常用选项的示例：

```json
{
  // 打包入口文件
  "input": "src/index.tsx",
  "output": {
    // 输出文件名是否包含 hash
    "filenameHash": true
  },
  "url": {
    // 部署的线上 publicPath
    "base": "/"
  },
  // 路径别名
  "alias": {
    "@": "src"
  },
  "html": {
    // 生成的 HTML 标题
    "title": "Modulo Page",
    // HTML meta 标签
    "meta": {
      "viewport": "width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover"
    },
    // 页面挂载点的 ID
    "root": "app"
  },
  // 需要外部化的依赖 (externals)
  "externals": [
    {
      "name": "react",
      "global_var": "React",
      "urls": ["https://unpkg.com/react@18.2.0/umd/react.production.min.js"]
    },
    {
      "name": "react-dom",
      "global_var": "ReactDOM",
      "urls": ["https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"]
    }
  ],
  // 开发服务器配置
  "dev_server": {
    "port": 8080,
    "open": true
  }
}
```