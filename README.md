# Modulo Monorepo

本项目是一个基于 pnpm-workspace 的 monorepo，其核心是 `modulo`，一个现代、高性能的通用前端项目打包工具。

## 👋 简介

`modulo` 旨在提供一种极速、配置简单且功能强大的前端构建方案。它利用了 Rust 工具链的性能优势，并提供了自动入口发现、强大的外部依赖管理和对主流框架（如 React 和 Vue）的内置支持。

本仓库不仅包含了 `modulo` 工具的源代码，还提供了一系列示例项目，以展示如何将其应用于实际开发中。

## 📂 仓库结构

```
/
├── packages/
│   ├── modulo/         # 核心打包工具
│   ├── react-17.0.2/   # React 示例项目
│   ├── vue-2.7.16/     # Vue 示例项目
│   └── ...             # 其他辅助包和示例
└── README.md           # 本文档
```

- **`packages/modulo`**: `modulo` CLI 工具的核心代码。如果您想了解其工作原理或为其贡献代码，这里是您的起点。
- **`packages/react-17.0.2`**: 一个使用 `modulo` 构建的 React 17 示例应用。
- **`packages/vue-2.7.16`**: 一个使用 `modulo` 构建的 Vue 2.7 示例应用。

## 🚀 快速开始

### 1. 安装依赖

本项目使用 `pnpm` 进行依赖管理。请在 monorepo 的根目录运行以下命令来安装所有依赖项：

```bash
pnpm install
```

### 2. 探索示例项目

我们强烈建议您从示例项目开始，以了解 `modulo` 的实际用法。

- **运行 React 示例**:
  ```bash
  cd packages/react-17.0.2
  pnpm run dev:page
  ```

- **运行 Vue 示例**:
  ```bash
  cd packages/vue-2.7.16
  pnpm run dev:page
  ```

每个示例项目的 `README.md` 文件都包含了更详细的说明。

### 3. 使用 `modulo`

`modulo` 工具的详细文档位于其包内。请参阅 [**`packages/modulo/README.md`**](./packages/modulo/README.md) 以获取关于其命令行接口、配置文件和核心功能的完整指南。
