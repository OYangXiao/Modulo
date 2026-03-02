# Modulo - 高性能通用前端打包工具

Modulo 是一款现代、灵活且功能强大的通用前端项目打包工具。它基于高性能的 Rust 工具链 (Rspack/Rsbuild)，旨在为现代前端项目提供极速的开发体验和高效的构建流程。通过简洁的配置，Modulo 即可支持 React、Vue 等多种主流框架，并具备良好的扩展性。

---

## 目录

- [✨ 核心功能](#-核心功能)
- [📦 先决条件](#-先决条件)
- [🚀 命令行接口 (CLI)](#-命令行接口-cli)
- [🧠 核心概念：入口发现机制](#-核心概念入口发现机制)
- [⚙️ 配置文件 (`modulo.config.json`)](#️-配置文件-moduloconfigjson)
- [🌐 强大的 `externals` 配置](#-强大的-externals-配置)

---

## ✨ 核心功能

- **极速构建**: 底层采用高性能 Rust 工具链 (Rspack/Rsbuild)，提供极致的开发和构建速度。
- **自动入口发现**: 无需手动配置每一个入口，Modulo 会自动扫描指定目录来发现项目的所有入口。
- **多框架支持**: 内置对 React、Vue 等流行框架的支持，并为 React 提供 `react-refresh` 等现代化开发体验。
- **零配置启动**: 通过 `modulo init` 命令快速初始化项目，自动生成配置文件和 `package.json` 脚本。
- **强大的开发服务器**: 内置高效的开发服务器，支持热模块替换（HMR）。
- **多种打包目标**: 支持将项目打包为**页面应用** (`page`) 或**独立的库** (`module`)。
- **自动 External**: 通过 `autoExternal` 功能，自动识别项目中使用的第三方库，并根据配置按需注入 Import Map 或 Script 标签，无需手动维护冗长的 HTML 模板。
- **灵活的产物格式**: 支持 `importmap` (ESM) 和 `script` (Global Variable) 两种 External 模式，适应不同的部署场景。

## 📦 先决条件

- [Node.js](https://nodejs.org/) (version 18+)
- [pnpm](https://pnpm.io/)

## 🚀 命令行接口 (CLI)

Modulo 提供 `init` 和 `pack` (`dev`/`build`/`preview`) 两个核心命令组。

### `modulo init`

用于在一个新项目或现有项目中初始化 Modulo。

**用法:** `modulo init <target> [options]`

- **`target` (必需):**

  - `config`: 创建 `modulo.config.json` 配置文件。
  - `script`: 在 `package.json` 中添加 `dev` 和 `build` 脚本。

- **`options`:**

| 参数 | 简写 | 描述 |
| :--- | :--- | :--- |
| `--path <path>` | | 指定配置文件的输出路径 (仅当 `target` 为 `config` 时有效)。 |
| `--force` | `-f` | 强制覆盖现有文件 (仅当 `target` 为 `config` 时有效)。 |
| `--preset <preset>` | | 指定预设配置，目前支持 `react`, `react19`, `vue`, `vue2`。 |

### `modulo dev` / `modulo build` / `modulo preview`

用于启动开发服务器、执行生产构建或预览产物。

**用法:** `modulo <dev|build|preview> <target> [options]`

- **`<target>` (位置参数, 必需):**

  - `page`: 构建或运行 `input.pages` 目录下的**所有**页面应用。
  - `module`: 构建或运行 `input.modules` 目录下的**所有**库。
  - `all`: 同时构建或运行页面和库。

- **`options`:**

| 参数 | 简写 | 描述 |
| :--- | :--- | :--- |
| `--env <dev\|prd>` | | 指定构建环境。`dev` 命令默认为 `dev`，`build` 命令默认为 `prd`。 |
| `--config <path>` | `-c` | 指定 `modulo.config.json` 文件的路径。 |
| `--watch` | `-w` | 在 `build` 模式下启用监听模式（对 `all` target 无效）。 |
| `--debug` | | 启用 Modulo 的调试日志，并在当前目录生成 `modulo.debug.log`。 |
| `--verbose` | `-v` | 在控制台显示更详细的日志信息。 |

## 🧠 核心概念：入口发现机制

Modulo 的一大特性是**自动入口发现**，您无需在配置文件中手动声明每一个入口文件。它能够智能地扫描指定目录，并根据一套优先级规则识别模块的入口文件。

其工作方式如下：

1.  在 `modulo.config.json` 的 `input` 字段中，您需要定义 `pages` 和 `modules` 的根目录（例如 `src/pages` 或 `src/modules`）。
2.  当您运行 `modulo dev page` 或 `modulo dev module` 时，Modulo 会自动扫描 `input.pages` 或 `input.modules` 指定的目录。
3.  它会将每一个包含有效入口文件的**直接子目录**识别为一个独立的模块入口。
4.  对于每个子目录，Modulo 会按照以下优先级顺序查找入口文件：
    - `index.ts`, `index.tsx`, `index.js`, `index.jsx`
    - `main.ts`, `main.tsx`, `main.js`, `main.jsx`
    - **如果项目检测为 Vue 框架**，则会优先查找以下文件：`index.vue`, `main.vue`, `[目录名].vue` (例如，如果目录名为 `my-component`，则查找 `my-component.vue`)
    - `[目录名].ts`, `[目录名].tsx`, `[目录名].js`, `[目录名].jsx`
5.  找到的第一个存在的文件将被视为该模块的入口文件。
6.  此后，`modulo dev` 或 `modulo build` 命令将会同时处理**所有**这些被发现的入口。

**示例**：对于一个名为 `src/pages/my-page` 的目录，如果项目是 Vue 框架，Modulo 可能会按 `index.ts` -> `index.vue` -> `my-page.vue` 的顺序查找入口文件。

## ⚙️ 配置文件 (`modulo.config.json`)

这是 Modulo 的核心配置文件，提供了丰富的选项来满足各种定制化需求。

---

### `input`

- **描述**: 定义源文件目录结构。此配置项的灵活性旨在帮助您在不修改现有项目结构的前提下，也能轻松集成 Modulo。
- **类型**: `object`
- **默认值**: `{ "src": "src", "modules": "modules", "pages": "pages" }`
- **属性**:
  - `src` (`string`): 源文件根目录。所有 `modules` 和 `pages` 的路径都将相对于此目录。
  - `modules` (`string`): 库/模块的源文件目录，路径相对于 `src`。Modulo 会在此目录中自动发现模块入口。
  - `pages` (`string`): 页面应用的源文件目录，路径相对于 `src`。Modulo 会在此目录中自动发现页面入口。
- **特别说明**:
  - 如果您的现有项目结构与 Modulo 的默认 `src/modules` 或 `src/pages` 不符，您可以直接修改这些路径以匹配您的项目。
  - 另一种灵活的做法是，在符合 Modulo 预设的目录（例如 `src/pages/`）下，为旧项目中的模块创建新的入口文件（如 `index.ts`）。这些新的入口文件可以简单地从旧路径导出模块，从而在不侵入式修改旧代码的情况下，让 Modulo 能够识别并打包它们。

### `output`

- **描述**: 定义构建产物的目录结构和命名规则。
- **类型**: `object`
- **默认值**: `{ "dist": "dist", "modules": "modules", "pages": "pages", "filenameHash": true }`
- **属性**:
  - `dist` (`string`): 构建产物的根目录。
  - `modules` (`string`): 库/模块的输出目录，路径相对于 `dist`。
  - `pages` (`string`): 页面应用的输出目录，路径相对于 `dist`。
  - `filenameHash` (`boolean`): 是否在输出文件名中包含内容哈希，用于长期缓存控制。

---

### `url`

- **描述**: 定义部署后资源的 URL 前缀。
- **类型**: `object`
- **默认值**: `{ "base": "/", "cdn": "" }`
- **属性**:
  - `base` (`string`): 部署站点的基础路径，例如 `/my-app/`。所有资源路径都会以此为前缀。
  - `cdn` (`string`): 静态资源的 CDN 地址。如果设置，所有非 HTML 的静态资源（如 JavaScript、CSS、图片等）都将通过此 CDN 地址访问，从而实现 CDN 加速。而 HTML 文件本身仍将通过您的 Web 服务器访问。如果省略，则所有资源都将使用 `base` 作为前缀。

---

### `alias`

- **描述**: 配置模块导入路径别名，以简化 `import` 语句。
- **类型**: `object`
- **默认值**: `{ "@": "{src}/" }`
- **特别说明**: 别名路径中的 `{src}` 占位符会被自动替换为 `input.src` 字段定义的绝对路径。
- **示例**:
  ```json
  "alias": {
    "@": "{input.src}/",
    "@components": "{input.src}/components"
  }
  ```

---

### `html`

- **描述**: 配置 `page` 类型入口的 HTML 文件生成。
- **类型**: `object`
- **属性**:
  - `template` (`string`): HTML 模板文件的路径。如果省略，将使用 Modulo 内置的默认模板。如果要提供 template 内容，可以参考 modulo 包中的 html 模板，或者按照 rsbuild 官方说明上的可修改项进行。
  - `root` (`string`): 应用挂载的根节点 ID。**默认值**: `"app"`。
  - `title` (`string`): 页面标题。**默认值**: `"Modulo Page"`。
  - `meta` (`object`): 一个键值对对象，用于生成 `<meta>` 标签。
  - `tags` (`array`): 一个对象数组，用于在 HTML 中注入自定义的 `<script>` 或 `<link>` 等标签。
    - **特别说明**: `webhost` 库的 `webhost.system.js` 文件会作为默认配置项自动注入到此处的 `tags` 中，以提供模块加载能力。

---

### `dev_server`

- **描述**: 配置开发服务器。
- **类型**: `object`
- **属性**:
  - `port` (`number`): 端口号。**默认值**: `8080`。
  - `open` (`boolean | string[]`): 是否在启动时自动打开浏览器。可指定打开的页面名称。**默认值**: `false`。
  - `proxy` (`object`): 配置 API 代理，用于解决开发环境下的跨域问题。参考 rsbuild 的 proxy。

---

### `define`

- **描述**: 定义全局变量，这些变量在编译时会被直接替换为相应的值。
- **类型**: `object`
- **特别说明**: Modulo 会自动注入 `process.env.NODE_ENV` 和 `import.meta.env.MOUNT_ID` (值等于 `html.root`)。
- **特别说明**: 此处书写的内容会被 JSON.stringify 后注入到代码中，无需重复引号。
- **示例**:
  ```json
  "define": { "API_URL": "https://api.example.com", "IS_PROD": true }
  ```

---

### `minify`

- **描述**: 配置代码压缩。
- **类型**: `boolean | object`
- **默认值**: `true` (表示在 `prd` 环境下启用 JS 和 CSS 压缩)。

---

### `analyze`

- **描述**: 是否生成打包分析报告。
- **类型**: `boolean`
- **默认值**: `false`。

---

### `autoExternal`

- **描述**: 是否开启自动 External 功能。开启后，Modulo 会自动扫描代码中引入的 `node_modules` 依赖，如果它们在 `externals` 中有定义，则自动注入对应的 Import Map 或 Script 标签。
- **类型**: `boolean`
- **默认值**: `true`。

---

### `externalsType`

- **描述**: 指定 External 的注入模式。
- **类型**: `"importmap" | "script"`
- **默认值**: `"importmap"`。
- **选项**:
  - `importmap`: 使用原生的 Import Map 特性（需要浏览器支持或 polyfill），适合 ESM 现代开发模式。
  - `script`: 将 External 映射为全局变量（如 `window.React`），适合传统 UMD 模式。

---

## 🌐 强大的 `externals` 配置

`externals` 是 Modulo 的一项核心功能，它允许您将一些体积较大、不常变动的第三方库（如 React, Vue, Lodash）从您的应用包中分离出去，改为通过 CDN 或其他外部服务器加载。

**核心优势**:

- **减小包体积**: 显著减少主包大小，加快应用加载速度。
- **利用浏览器缓存**: 用户在访问不同应用时，可以复用已缓存的公共库。
- **加快构建速度**: 无需重复打包这些大型库。
- **按需注入**: 配合 `autoExternal: true`，只有当页面真正引用了某个库时，它的 CDN 链接才会被注入到 HTML 中。

### 工作原理

当您在 `externals` 中配置一个库时，Modulo 会执行两个关键操作：

1.  **告知打包器**: 它会配置底层的打包器（Rspack），告诉它在代码中遇到 `import React from 'react'` 这样的语句时，不要将 `react` 库打包进来，而是将其视为一个“外部的”、在运行时已经存在的依赖。
2.  **自动注入脚本**: 对于 `page` 类型的入口，Modulo 会读取 `externals` 的配置，并自动在生成的 HTML 文件中注入相应的 `<script>` 标签（Import Map 或普通 Script），以从您指定的 URL 加载这个库。

### 配置详解

- **基本用法 (字符串)**:
  最简单的配置方式是提供一个库名和其对应的 URL。

  ```json
  "externals": {
    "jquery": "https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"
  }
  ```

  这会告诉打包器忽略 `jquery`，并在 importmaps 中注册 `jquery` 的加载地址。

- **高级用法 (对象)**:
  为了更精细的控制，您可以使用对象形式进行配置。
  ```json
  "externals": {
    "react-dom": {
      "importName": ["react-dom", "ReactDOM"],
      "url": "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/+esm"
    }
  }
  ```
  - **`importName`** (`string | string[]`, 可选):
    - **作用**: 定义了在代码中匹配哪些导入名称。例如，`["react-dom", "ReactDOM"]` 可以同时匹配 `import ReactDOM from 'react-dom'` 和一些非标准的 `import ReactDOM from 'ReactDOM'` 写法。
    - **默认值**: 如果省略，则使用 `externals` 的键名（例如 `"react-dom"`）。
  - **`url`** (`string | object`, 必需):
    - **作用**: 指定库的加载地址。
    - **字符串形式**: 如果是字符串，则在所有模式下都使用该 URL。
    - **dev 和 prd 模式**
      - 对 url 对象进行嵌套，以分别指定 dev 和 prd 模式下的 URL。

## 外部依赖加载

当 `modulo` 打包您的应用程序时，它会以特定的方式处理外部依赖项，以支持模块化加载和高效缓存。外部依赖项（如 React、Vue、jQuery 等）不会直接打包到您的模块输出中。相反，它们期望在运行时由宿主环境提供。

这主要通过 **Import Maps (ESM)** 或 **Global Variables (UMD)** 进行管理，具体取决于 `externalsType` 的配置。

### Import Maps (推荐)

导入映射是一个 JSON 对象，允许您控制模块说明符的解析。在 `modulo` 的上下文中，您可以在 `index.html`（或类似的入口文件）中的导入映射中定义您的外部依赖项及其对应的 URL。

**导入映射示例：**

```html
<script type="importmap">
  {
    "imports": {
      "react": "https://cdn.jsdelivr.net/npm/react@17.0.2/esm/react.production.min.js",
      "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@17.0.2/esm/react-dom.production.min.js"
    }
  }
</script>
```

在此示例中：

- 当您的打包模块尝试 `import React from 'react'` 时，浏览器会将其解析为 `https://cdn.jsdelivr.net/npm/react@17.0.2/esm/react.production.min.js`。
