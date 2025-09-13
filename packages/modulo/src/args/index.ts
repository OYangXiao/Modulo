import minimist from 'minimist';
import { default_config_file_name } from '../config/default';
import { get_cmd } from './cmd';
import { get_mode } from './mode';
import { set_node_env } from './node_env';

const argv = minimist(process.argv.slice(2));

const cmd = get_cmd(argv);

export const args = {
  // 命令
  cmd,
  // 配置文件路径
  config_file: (argv.config as string | undefined) || default_config_file_name,
  // 是否是调试modulo
  debug: argv.debug === 'true',
  // 运行模式, dev | prd
  mode: cmd === 'build' || cmd === 'dev' ? get_mode(argv, cmd) : ('' as ''),
  // 创建配置文件的文件名
  name: argv.name as string | undefined,
};

args.mode && set_node_env(args.mode);

export const debug_mode = args.debug;
if (debug_mode) console.log('args: ', args);
