import { resolve } from "node:path";
import type { Modulo_Build_Args } from "../../cli/args/resolve.ts";
import { debug_log } from "../../tools/log-debug.ts";
import { resolve_and_read_file } from "../../tools/file.ts";
import { merge_user_config } from "./merge-user-config.ts";
import { expect } from "../../tools/expect.ts";
import { preset_config } from "./preset/index.ts";
import { preset_minify_config } from "./preset/minify.ts";
import type { GLOBAL_CONFIG, USER_CONFIG } from "./type.ts";


let global_config: GLOBAL_CONFIG;

export const create_config = (config: USER_CONFIG) => config;

/**
 * 合并用户配置文件
 */
export async function merge_config(
  args: Modulo_Build_Args
): Promise<GLOBAL_CONFIG> {
  if (global_config) return global_config;

  const user_config = await import(resolve_and_read_file(root, args.config)).then(
    (m) => m.default(args.env) as USER_CONFIG
  );
  expect(!user_config, "根目录下没有配置文件");
  debug_log("input user config", user_config);

  /**
   * 将配置文件和默认配置合并
   */
  merge_user_config(preset_config, user_config);
  const _config: GLOBAL_CONFIG = preset_config;

  /**
   * src目录
   */
  const src = resolve(root, _config.input.src);
  const input = {
    modules: resolve(src, _config.input.modules),
    pages: resolve(src, _config.input.pages),
    src: src,
  };

  /**
   * dist目录
   */
  const dist = resolve(root, _config.output.dist);
  const output = {
    ..._config.output,
    dist: dist,
    modules: resolve(dist, _config.output.modules),
    pages: resolve(dist, _config.output.pages),
  };

  /**
   * 允许定制template
   */
  const html = _config.html?.template
    ? { ..._config.html, template: resolve(root, _config.html.template) }
    : _config.html;

  /**
   * 所有define的值都序列化以正确传入
   */
  const define = Object.fromEntries(
    Object.entries({
      ..._config.define,
      "process.env.NODE_ENV": process.env.NODE_ENV,
      "import.meta.env.MOUNT_ID": _config.html.root,
    }).map(([k, v]) => [k, JSON.stringify(v)])
  );
  debug_log("当前模式", process.env.NODE_ENV);

  /**
   * minify代码的开关
   */
  const minify =
    _config.minify === true ? preset_minify_config : _config.minify;

  /**
   * alias 允许使用{src}作为占位符，取值来自input.src
   */
  const alias = Object.fromEntries(
    Object.entries(_config.alias).map(([k, v]) => [
      k,
      v.replace("{input.src}", input.src),
    ])
  );

  global_config = {
    ..._config,
    define,
    html,
    input,
    minify,
    output,
    alias,
  };
  debug_log("global config", global_config);
  return global_config;
}
