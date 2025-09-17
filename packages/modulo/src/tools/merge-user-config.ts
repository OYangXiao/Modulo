import { PANIC_IF } from "./panic.ts";

export function merge_user_config(target: any, input: any) {
  for (const key in input) {
    const from = input[key];
    const to = target[key];
    if (typeof from !== typeof to || !(key in target)) {
      target[key] = from;
      continue;
    } else {
      if (Array.isArray(to)) {
        PANIC_IF(!Array.isArray(from));
        target[key] = [...to, ...from];
      } else if (typeof to === "object") {
        merge_user_config(to, from);
      } else {
        target[key] = from;
      }
    }
  }
}
