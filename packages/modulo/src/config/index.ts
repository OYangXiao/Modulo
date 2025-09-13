import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { args } from '../args/index.ts';
import { debug_log } from '../tools/debug-log.ts';
import { resolve_and_read } from '../tools/file.ts';
import { jsonparse } from '../tools/json.ts';
import { PANIC_IF } from '../tools/panic.ts';
import { default_config } from './default.ts';
import { merge_user_config } from './merge-user-config.ts';
import type { GLOBAL_CONFIG } from './type.ts';

/**
 * 命令启动时候的目录作为根目录
 */
export const root = cwd();

/**
 * 读取package.json
 */
// biome-ignore lint/style/noNonNullAssertion: <panic if content nullable>
export const packagejson = jsonparse<{
  name: string;
  dependencies: Record<string, string>;
}>(resolve_and_read(root, 'package.json'))!;
PANIC_IF(!packagejson, '根目录下没有package.json');
debug_log('package.json', packagejson);

let global_config: GLOBAL_CONFIG;

export function get_global_config() {
  if (global_config) return global_config;
  /**
   * 读取配置文件
   */
  const user_config = jsonparse<GLOBAL_CONFIG>(resolve_and_read(root, args.config_file));
  PANIC_IF(!user_config, '根目录下没有配置文件');
  debug_log('input user config', user_config);

  /**
   * 将配置文件和默认配置合并
   */
  merge_user_config(default_config, user_config);
  const _config: GLOBAL_CONFIG = default_config;

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

  const define = {
    ...Object.fromEntries(Object.entries(_config.define).map(([k, v]) => [k, JSON.stringify(v)])),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  };

  debug_log('当前模式', process.env.NODE_ENV);

  /**
   * minify代码的开关
   */
  const minify = typeof _config.minify === 'boolean' ? _config.minify : process.env.NODE_ENV === 'production';

  global_config = {
    ..._config,
    define,
    html,
    input,
    minify,
    output,
  };
  debug_log('global config', global_config);
  return global_config;
}
