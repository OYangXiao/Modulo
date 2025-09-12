import minimist from 'minimist';
import { PANIC_IF } from '../tools/panic';

export const default_config_file_name = 'modulo.config.json';

const argv = minimist(process.argv.slice(2));

const cmd_list = ['pack', 'create-config'] as const;

const cmd = argv._[0] as (typeof cmd_list)[number];
PANIC_IF(!cmd_list.includes(cmd), 'modulo-pack必须执行build或者dev命令');

export const args = {
  cmd,
  config_file: (argv.config as string | undefined) || default_config_file_name,
  debug: argv.debug === 'true',
  mode: (argv.mode === 'dev' ? 'dev' : 'build') as 'dev' | 'build',
  name: argv.name as string | undefined,
};

export const debug_mode = args.debug;

if (args.debug) console.log('args: ', args);
