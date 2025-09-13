import { args } from './args';
import { build } from './cli/build';
import { create_config_file } from './cli/config-file';

if (args.cmd === 'create-config') {
  create_config_file();
} else if (args.cmd === 'build' || args.cmd === 'dev') {
  build(args.cmd);
}
