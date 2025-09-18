import { System } from "../systemjs.ts";
import { get_root_element, load_module } from "./module.ts";

/**
 * Mounts a React component to a specified DOM element.
 * Assumes React and ReactDOM are already loaded via SystemJS.
 * @param component The React component to mount.
 * @param selector The CSS selector of the DOM element to mount to.
 * @param props Optional: The props to pass to the component.
 *
 * @returns The mounted component instance.
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
 * 一个函数执行load和mount两个操作
 * 并且返回react component
 * 以及update和unmount函数
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
