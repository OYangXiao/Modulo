import minimist from 'minimist';
import { PANIC_IF } from '../tools/panic';

const argv = minimist(process.argv.slice(2));

const cmd = argv._[0] as 'build' | 'dev';
PANIC_IF(!['build', 'dev'].includes(cmd), 'modulo-pack必须执行build或者dev命令');

export const args = {
  cmd,
  debug: argv.debug === 'true',
  config_file: (argv.config as string) || 'modulo.config.json',
};

export const debug_mode = args.debug;

if (args.debug) console.log('args: ', args);
