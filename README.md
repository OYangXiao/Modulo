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
├── bak/          # 历史实现备份（仅供按需参考）
└── README.md           # 本文档
```

- **`packages/modulo`**: CLI 汇总包，负责组合 builder 与 helper，并作为对外统一入口。
- **`packages/builder`**: build / dev-server 能力包，后续会承载多框架适配实现。
- **`packages/helper`**: 脚手架辅助能力（初始化、环境检测等）。
- **`packages/common`**: 通用函数与类型定义。
- **`bak`**: 从历史项目搬运的旧代码备份，当前阶段不作为实现来源，仅在需要时按需参考。

## 🚀 快速开始

### 1. 安装依赖

本项目使用 `pnpm` 进行依赖管理。请在 monorepo 的根目录运行以下命令来安装所有依赖项：

```bash
pnpm install
```

### 2. 开发约定

- `packages/modulo` 的 `index.ts` 作为对外唯一入口，负责汇总导出与 CLI 入口定义
- `packages/builder` / `packages/helper` / `packages/common` 均以 `index.ts` 作为对外入口，保持 API 表面稳定
