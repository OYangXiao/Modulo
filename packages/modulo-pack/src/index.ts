import { args } from './args';
import { pack } from './builder';
import { create_config_file } from './cli/create-config-json';

if (args.cmd === 'create-config') {
  create_config_file(args.name);
} else if (args.cmd === 'pack') {
  pack();
}
