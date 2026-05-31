# @yannick-z/modulo-cli-options

modulo 的菜单配置与业务实现（业务相关）。

## 职责

- 定义 modulo 的一级菜单与子菜单配置（例如 detect/env/config）
- 提供每个菜单选项对应的业务函数实现
- 不负责 CLI 运行时行为（交互循环、输入解析、Ctrl-C 处理等由 `@yannick-z/modulo-cli-framework` 提供）

## 导出

- `moduloMenu`：modulo 主菜单定义
