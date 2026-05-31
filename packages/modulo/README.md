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
- `modulo dev` / `modulo build`：占位命令（当前会先执行 detect）
- `modulo init`：占位命令

交互模式：

- 直接执行 `modulo` 进入循环菜单
- 输入 `0` 退出
- 每次命令执行完提示按回车继续，再返回菜单

## 结构

- `index.ts`：对外唯一入口，汇总导出 builder / helper / common 的能力，并提供 CLI 入口函数
