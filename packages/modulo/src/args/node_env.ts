import picocolors from 'picocolors';

export function set_node_env(mode: 'dev' | 'prd') {
  /**
   * 保证process.env.NODE_ENV有值
   */
  const _node_env = mode === 'dev' ? 'development' : 'production';
  if (process.env.NODE_ENV !== _node_env) {
    console.log(
      picocolors.yellow('\nprocess.env.NODE_ENV 与 mode 不一致, 将被强制设置为与mode匹配的值\n'),
      picocolors.yellow(`mode = ${mode}, process.env.NODE_ENV = ${_node_env}\n`),
    );
    process.env.NODE_ENV = _node_env;
  }
}
