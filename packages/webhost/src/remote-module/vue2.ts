import { System } from "../systemjs.ts";
import { get_root_element, load_vue_module } from "./module.ts";

/**
 * 将 Vue 2 组件初始化并挂载到指定的 DOM 元素。
 * 假设 Vue 已经通过 SystemJS 加载。
 * @param module 要挂载的 Vue 组件模块。
 * @param root DOM 元素的 HTMLElement 实例或 CSS 选择器字符串。
 * @param props 可选：传递给组件的 props。
 *
 * @returns 挂载的组件实例。
 */
export async function init_vue2_component(
  module: any,
  element: HTMLElement,
  props: any
): Promise<any> {
  const Vue = (await System.import("vue")).default;
  const initiator = Vue.extend(module);
  if (element && initiator) {
    const component = new initiator({
      el: element,
      propsData: props,
    });
    return component;
  }
}

export function unmount_vue2_component(element: HTMLElement, component: any) {
  component && component.$destroy();
  element && element.removeChild(component.$el);
  return true;
}

/**
 * 一个函数，执行加载和挂载 Vue 2 组件的操作。
 * 并返回 Vue 组件实例以及卸载函数。
 */
export async function mount_vue2_component({
  path,
  root,
  props,
}: {
  path: string;
  root: HTMLElement | string;
  props?: any;
}) {
  const element = get_root_element(root);
  const module = await load_vue_module(path);

  if (module && element) {
    const shadow_root =
      element.shadowRoot || element.attachShadow({ mode: "open" });
    const _element = document.createElement(element.tagName);
    shadow_root.appendChild(_element);

    const component = await init_vue2_component(module, _element, props);
    if (component) {
      const css_link = document.createElement("link");
      css_link.href = path.replace(".js", ".css");
      css_link.rel = "stylesheet";
      shadow_root.prepend(css_link);
      return {
        component,
        element: _element,
        unmount: () => unmount_vue2_component(_element, component),
      };
    }
  }
}
