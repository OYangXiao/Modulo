# @yannick-z/modulo-helper

提供 CLI 的通用辅助能力（非打包相关）。

## 职责

- 项目初始化（模板选择、目录创建、依赖安装策略等）
- 环境检测（Node 版本、包管理器、系统信息等）
- 项目依赖检测（UI 库版本识别与校验）
- CLI 交互能力（后续按需引入）

## 入口

- `index.ts`：统一导出对外 API

## 已实现能力

### detectUiLibraries

检测当前项目安装的 UI 库与版本，支持并校验：

- Vue：仅支持 `2.7.16`（精确版本）或 `3.x`
- React：仅支持 `17+`
- Lit：仅支持 `3+`

当出现未安装、版本不符合或未检测到 UI 库时，会抛出 `UiLibraryDetectionError`，用于在 CLI 层输出清晰的错误信息。

### ensureNode24Plus

校验当前 Node.js 版本必须为 24+（该脚手架将默认使用 Node 24+ 的能力运行）。
