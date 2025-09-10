import { defaults } from "../defaults";
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2));

export const args = {
  cmd: argv._[0] || defaults.args.cms,
  debug: argv.debug === 'true',
  config_file: argv.config || defaults.args.config_file
}

if (args.debug) console.log('args: ', args);
