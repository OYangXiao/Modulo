# Modulo Monorepo

本项目是一个基于 pnpm-workspace 的 monorepo，其目标是打造一个面向多框架的综合构建脚手架。

## 👋 简介

`modulo` 旨在提供一套统一的构建与开发体验，覆盖以下目标框架版本：

- Vue 2.7.16
- React 17.0.2
- Vue 3 最新版
- React 最新版
- Lit 最新版

目前仓库处于重构阶段：先完成包结构与对外入口约定，再逐步补齐构建器实现与各框架适配。

## 📂 仓库结构

```
/
├── packages/
│   ├── modulo/   # CLI 功能汇总入口（对外统一入口）
│   ├── builder/  # build / dev-server 能力
│   ├── helper/   # 项目初始化、环境检测等非打包能力
│   └── common/   # 通用函数与类型
├── example/      # 用于验证 CLI/检测逻辑的示例项目集合
├── bak/          # 历史实现备份（仅供按需参考）
└── README.md           # 本文档
```

- **`packages/modulo`**: CLI 汇总包（`@yannick-z/modulo`），负责组合 builder 与 helper，并作为对外统一入口。
- **`packages/builder`**: build / dev-server 能力包（`@yannick-z/modulo-builder`），后续会承载多框架适配实现。
- **`packages/helper`**: 脚手架辅助能力（`@yannick-z/modulo-helper`），包含环境检测与依赖检测等。
- **`packages/common`**: 通用函数与类型定义（`@yannick-z/modulo-common`）。
- **`example`**: 示例项目集合，用于验证 `modulo` CLI 与 `helper` 检测逻辑。
- **`bak`**: 从历史项目搬运的旧代码备份，当前阶段不作为实现来源，仅在需要时按需参考。

## 🚀 快速开始

### 1. 安装依赖

本项目使用 `pnpm` 进行依赖管理。请在 monorepo 的根目录运行以下命令来安装所有依赖项：

```bash
pnpm install
```

### 2. 运行要求

- Node.js 24+（CLI 默认基于 Node 24+ 工作流运行）

### 3. CLI（已实现能力）

`@yannick-z/modulo` 提供以下命令（当前阶段以检测与占位实现为主）：

- `modulo detect`：检测当前项目的 UI 库（vue/react/lit）与版本，并校验是否满足脚手架支持范围
- `modulo env`：输出环境信息（node/platform/arch）
- `modulo dev` / `modulo build`：占位命令（当前会先执行 detect，然后结束）
- `modulo init`：占位命令

交互模式：

- 在交互终端中直接执行 `modulo`，会进入循环菜单
- 输入 `0` 退出
- 每次命令执行完会提示按回车继续，再返回菜单

### 4. example（用于验证检测逻辑）

`example/` 目录内的项目用于覆盖“未安装/不支持版本”等场景，便于验证 `detectUiLibraries` 的报错与提示是否符合预期：

- `example/no-ui`：不安装任何 UI 库（期望报 `NO_UI_LIBRARY`）
- `example/vue2-old`：安装 vue 2 老版本（期望报 `UNSUPPORTED_VERSION`）
- `example/react16`：安装 react 16（期望报 `UNSUPPORTED_VERSION`）
- `example/lit2`：安装 lit 2.x（期望报 `UNSUPPORTED_VERSION`）

在任意 example 项目中执行：

```bash
pnpm -C example/no-ui exec modulo detect
pnpm -C example/vue2-old exec modulo detect
pnpm -C example/react16 exec modulo detect
pnpm -C example/lit2 exec modulo detect
```

### 5. 开发约定

- `packages/modulo` 的 `index.ts` 作为对外唯一入口，负责汇总导出与 CLI 入口定义
- `packages/builder` / `packages/helper` / `packages/common` 均以 `index.ts` 作为对外入口，保持 API 表面稳定
