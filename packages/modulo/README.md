# @yannick-z/modulo

CLI 功能汇总包。

## 宗旨

提供 Vue 2.7、React 17、Vue 3 最新版、React 最新版、Lit 最新版等多框架的统一构建与开发体验。

## 运行要求

- Node.js 24+

## CLI

基础命令：

- `modulo detect`：检测当前项目 UI 库（vue/react/lit）与版本，并校验支持范围
- `modulo env`：输出环境信息（node/platform/arch）
- `modulo config`：进入配置文件交互菜单（check / init）
- `modulo config check`：检查当前项目是否存在 `modulo.config.ts`
- `modulo config init`：创建默认 `modulo.config.ts`（若已存在会在交互终端询问是否覆盖，可使用 `--force` 强制覆盖）
- `modulo dev` / `modulo build`：占位命令（当前会先执行 detect）
- `modulo init`：占位命令

交互模式：

- 直接执行 `modulo` 进入循环菜单
- 输入 `0` 退出
- 每次命令执行完提示按回车继续，再返回菜单

## 架构

- `@yannick-z/modulo-cli-options`：提供菜单配置与业务实现（detect/env/config 等）
- `@yannick-z/modulo-cli-framework`：提供通用 CLI 框架（交互循环、输入解析、子命令分发、Ctrl-C 正常退出等）

## 结构

- `index.ts`：对外唯一入口，汇总导出 builder / common / cli-options 的能力，并通过 cli-framework 驱动 CLI
