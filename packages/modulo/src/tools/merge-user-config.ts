import { PANIC_IF } from "./panic.ts";

export function merge_user_config(
  target: any,
  input: any,
  path = [] as string[]
) {
  for (const key in input) {
    if (key in target) {
      const _path = [...path, key];
      const error_msg = `${_path.join(
        "->"
      )}处的类型与要求不一致, 请参考说明文档的默认配置`;

      const from = input[key];
      const to = target[key];

      if (Array.isArray(to)) {
        PANIC_IF(!Array.isArray(from), error_msg);
        target[key] = [...to, ...from];
      } else {
        PANIC_IF(typeof from !== typeof to, error_msg);
        typeof to === "object"
          ? merge_user_config(to, from, _path)
          : (target[key] = from);
      }
    }
  }
}
