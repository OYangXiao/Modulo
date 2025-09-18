import { System } from "../systemjs.ts";

/**
 * 加载远程模块
 * @param modulePath 远程模块路径
 * @param key 模块导出键
 *
 * @returns 模块导出值
 */
export async function load_module(path: string, key?: string, key2?: string) {
  const module = await System.import(path);
  console.log("module", path, module);
  if (module) {
    let _module = key ? module[key] : module.default;
    if (key2) {
      _module = _module[key2];
    }
    return _module;
  } else {
    console.error(`Module not found: ${path}`);
  }
}

export const load_react_module = load_module;
export const load_vue_module = (path: string) =>
  load_module(path, "default", "default");
/**
 * 获取根元素
 */
export function get_root_element(root: HTMLElement | string) {
  return typeof root === "string"
    ? (document.querySelector(root) as HTMLElement)
    : root instanceof HTMLElement
    ? root
    : undefined;
}
