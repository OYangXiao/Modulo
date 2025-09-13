import { args } from './args/index.ts';
import { create_config_file } from './cli/create-config-file.ts';
import { pack_code } from './cli/pack-code.ts';

if (args.cmd === 'create-config') {
  create_config_file();
} else if (args.cmd === 'build' || args.cmd === 'dev') {
  pack_code(args.cmd);
}
