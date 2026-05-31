# @yannick-z/modulo-cli-framework

通用 CLI 框架（业务无关）。

## 职责

- 提供可配置的菜单框架：通过 `title/options` 定义菜单
- 支持交互式菜单循环（输入匹配、执行、暂停、子菜单、返回/退出）
- 支持非交互式命令分发（基于 option 的 `name`）
- 处理 Ctrl-C / AbortError 的正常退出

## 核心 API

- `createCliMenu(menu, options?)`：同时支持交互式与非交互式模式
- `runMenu(menu, options)`：仅运行交互式菜单循环（更底层）
