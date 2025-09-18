import { mount_react_component } from "./react.ts";
import { mount_vue2_component } from "./vue2.ts";

export async function mount_module(params: {
  path: string;
  root: HTMLElement | string;
  key?: string;
  props?: any;
  type: "react" | "vue2";
}) {
  const { type, ...rest } = params;
  if (type === "react") {
    return mount_react_component(rest);
  }
  if (type === "vue2") {
    return mount_vue2_component(rest);
  }
}
