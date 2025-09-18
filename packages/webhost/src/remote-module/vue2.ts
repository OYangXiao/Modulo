import { System } from "../systemjs.ts";
import { get_root_element, load_vue_module } from "./module.ts";

/**
 * Mounts a React component to a specified DOM element.
 * Assumes React and ReactDOM are already loaded via SystemJS.
 * @param module The React component to mount.
 * @param selector The CSS selector of the DOM element to mount to.
 * @param props Optional: The props to pass to the component.
 *
 * @returns The mounted component instance.
 */
export async function init_vue2_component(
  module: any,
  root: HTMLElement | string,
  props: any
): Promise<any> {
  const Vue = (await System.import("vue")).default;
  const element = get_root_element(root);
  const initiator = Vue.extend(module);
  if (element && initiator) {
    const component = new initiator({
      el: element,
      propsData: props,
    });
    return component;
  }
}

export function unmount_vue2_component(
  root: HTMLElement | string,
  component: any
) {
  const root_element = get_root_element(root);
  component && component.$destroy();
  root_element && root_element.removeChild(component.$el);
  return true;
}

/**
 * 一个函数执行load和mount两个操作
 * 并且返回react component
 * 以及update和unmount函数
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
    const component = await init_vue2_component(module, element, props);
    if (element) {
      return {
        component,
        element,
        unmount: () => unmount_vue2_component(element, component),
      };
    }
  }
}
