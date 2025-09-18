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
export async function init_react_component(
  module: any,
  root: HTMLElement | string,
  props: any
): Promise<any> {
  const React = await System.import("react");
  const ReactDOM = await System.import("react-dom");
  const element = get_root_element(root);
  const component = React.createElement(module, props);
  if (element) {
    ReactDOM.render(component, element);
    return component;
  }
}

export async function update_react_component(
  component: any,
  root: HTMLElement | string,
  props: any
) {
  const React = await System.import("react");
  const ReactDOM = await System.import("react-dom");
  const element = get_root_element(root);
  ReactDOM.unmountComponentAtNode(element);
  const new_component = React.cloneElement(component, props);
  ReactDOM.render(new_component, element);
  return new_component;
}

export async function unmount_react_component(root: HTMLElement | string) {
  const element = get_root_element(root);
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
    const component = await init_react_component(module, element, props);
    if (component) {
      const react_component = {
        component: component,
        element,
        unmount: () => unmount_react_component(element),
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
