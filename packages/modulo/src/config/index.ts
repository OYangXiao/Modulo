import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { args } from '../args';
import { resolve_and_read } from '../tools/file';
import { jsonparse } from '../tools/json';
import { PANIC_IF } from '../tools/panic';
import { write_log } from '../tools/write-log';
import { default_config, type USER_CONFIG } from './default';
import { merge_user_config } from './merge-user-config';

/**
 * 命令启动时候的目录作为根目录
 */
export const root = cwd();

/**
 * 读取package.json
 */
// biome-ignore lint/style/noNonNullAssertion: <panic if content nullable>
export const packagejson = jsonparse<PackageJson>(resolve_and_read(root, 'package.json'))!;
PANIC_IF(!packagejson, '根目录下没有package.json');
write_log('package.json', packagejson);

let global_config: USER_CONFIG;

export function get_global_config() {
  if (global_config) return global_config;
  /**
   * 读取配置文件
   */
  const user_config = jsonparse<USER_CONFIG>(resolve_and_read(root, args.config_file));
  PANIC_IF(!user_config, '根目录下没有配置文件');
  write_log('input user config', user_config);

  /**
   * 将配置文件和默认配置合并
   */
  const _config: USER_CONFIG = merge_user_config(default_config, user_config);

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

  write_log('当前模式', process.env.NODE_ENV);

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
  write_log('global config', global_config);
  return global_config;
}
