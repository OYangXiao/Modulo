import minimist from 'minimist';
import { default_config_file_name } from '../config/default.ts';
import { PANIC_IF } from '../tools/panic.ts';
import { get_cmd } from './cmd.ts';
import { get_mode } from './mode.ts';
import { set_node_env } from './node_env.ts';

interface ModuloArgs {
  cmd: ReturnType<typeof get_cmd>;
  pack: {
    config_file: string;
    mode: 'dev' | 'prd';
  };
  debug: boolean;
  create_config: {
    name: string | undefined;
    preset: 'react' | 'vue';
    force: boolean;
  };
  verbose: boolean;
}

let args: ModuloArgs;

export function get_args() {
  if (!args) {
    const argv = minimist(process.argv.slice(2));

    const cmd = get_cmd(argv);

    const preset = argv.preset as 'react' | 'vue';
    preset && PANIC_IF(preset !== 'react' && preset !== 'vue', '目前只支持react和vue');

    args = {
      // 命令
      cmd,
      create_config: {
        force: argv.force === 'true' || argv.f,
        name: argv.name as string | undefined,
        preset,
      },
      // 是否是调试modulo
      debug: argv.debug === 'true',
      pack: {
        // 配置文件路径
        config_file: (argv.config as string | undefined) || default_config_file_name,
        // 运行模式, dev | prd
        mode: cmd === 'build' || cmd === 'dev' ? get_mode(argv, cmd) : 'prd',
        // 创建配置文件的文件名
      },
      verbose: argv.verbose === 'true',
    };

    args.pack.mode && set_node_env(args.pack.mode);
    if (args.verbose) console.log('args: ', args);
  }

  return args;
}
