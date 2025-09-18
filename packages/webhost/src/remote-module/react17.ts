import { System } from "../systemjs.ts";
import { get_root_element, load_module } from "./module.ts";

/**
 * 将 React 组件初始化并挂载到指定的 DOM 元素。
 * 假设 React 和 ReactDOM 已经通过 SystemJS 加载。
 * @param module 要挂载的 React 组件模块。
 * @param root DOM 元素的 HTMLElement 实例或 CSS 选择器字符串。
 * @param props 可选：传递给组件的 props。
 *
 * @returns 挂载的组件实例。
 */
export async function init_react17_component(
  module: any,
  element: ShadowRoot,
  props: any
): Promise<any> {
  const React = await System.import("react");
  const ReactDOM = await System.import("react-dom");
  const component = React.createElement(module, props);
  if (element) {
    ReactDOM.render(component, element);
    return component;
  }
}

export async function update_react_component(
  component: any,
  element: ShadowRoot,
  props: any
) {
  const React = await System.import("react");
  const ReactDOM = await System.import("react-dom");
  ReactDOM.unmountComponentAtNode(element);
  const new_component = React.cloneElement(component, props);
  ReactDOM.render(new_component, element);
  return new_component;
}

export async function unmount_react_component(element: ShadowRoot) {
  const ReactDOM = await System.import("react-dom");
  if (element) {
    ReactDOM.unmountComponentAtNode(element);
    element.innerHTML = "";
    return true;
  }
}

/**
 * 一个函数，执行加载和挂载 React 组件的操作。
 * 并返回 React 组件实例以及更新和卸载函数。
 */
export async function mount_react_component({
  path,
  root,
  key,
  props,
}: {
  path: string;
  root: HTMLElement | string;
  key?: string;
  props?: any;
}) {
  const element = get_root_element(root);
  const module = await load_module(path, key);

  if (module && element) {
    const shadow_root =
      element.shadowRoot || element.attachShadow({ mode: "open" });
    const component = await init_react17_component(module, shadow_root, props);

    if (component) {
      const css_link = document.createElement("link");
      css_link.href = path.replace(".js", ".css");
      css_link.rel = "stylesheet";
      shadow_root.prepend(css_link);

      const react_component = {
        component: component,
        element: shadow_root,
        unmount: () => unmount_react_component(shadow_root),
        update(props: any) {
          return (react_component.component = update_react_component(
            react_component.component,
            react_component.element,
            props
          ));
        },
      };

      return react_component;
    }
  }
}
