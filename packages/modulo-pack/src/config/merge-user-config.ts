import { PANIC_IF } from '../tools/panic';

export function merge_user_config(target: any, input: any, path = [] as string[]) {
  for (const key in input) {
    if (key in target) {
      path.push(key);
      const error_msg = `${path.join('->')}处的类型与要求不一致, 请参考说明文档的默认配置`;

      const from = input[key];
      const to = target[key];

      if (Array.isArray(to)) {
        PANIC_IF(!Array.isArray(from), error_msg);
        target[key] = [...to, ...from];
      } else {
        PANIC_IF(typeof from !== typeof to, error_msg);
        target[key] = typeof to === 'object' ? merge_user_config(from, to, path) : from;
      }
    }
  }
  return target;
}
