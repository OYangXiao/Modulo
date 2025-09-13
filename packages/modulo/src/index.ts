import { get_args } from './args/index.ts';
import { create_config_file } from './cli/create-config-file.ts';
import { pack_code } from './cli/pack-code.ts';

export function exec() {
  const args = get_args();

  if (args.cmd === 'create-config') {
    create_config_file();
  } else if (args.cmd === 'build' || args.cmd === 'dev') {
    pack_code(args.cmd);
  }
}
