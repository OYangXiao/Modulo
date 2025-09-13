import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { debug_log } from './debug-log.ts';

let packageRoot = '';

export function get_package_root() {
  if (!packageRoot) {
    const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
    const __dirname = dirname(__filename); // get the name of the directory

    let currentDir = path.resolve(__dirname);
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const potentialPkgJson = path.join(currentDir, 'package.json');
      if (fs.existsSync(potentialPkgJson)) {
        break;
      }
      currentDir = path.dirname(currentDir);
    }

    debug_log('packageRoot', currentDir);
    packageRoot = currentDir;
  }

  return packageRoot;
}
