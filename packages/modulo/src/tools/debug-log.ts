import * as fs from 'node:fs';
import * as path from 'node:path';
import picocolors from 'picocolors';
import { args } from '../args/index.ts';

const logFile = path.join(process.cwd(), 'modulo.debug.log');
let index = 0;

export function debug_log(hint: string, ...params: any) {
  if (args.debug || args.verbose) {
    const timestamp = new Date().toISOString();
    const sn = String(index++).padStart(3, '0');
    const logEntry = `--------------\n${sn} [${timestamp}] ${hint}\n${params
      .map((p: unknown) => (typeof p === 'object' ? JSON.stringify(p, null, 2) : String(p)))
      .join('\n')}\n---------------\n\n`;

    if (args.verbose) {
      console.log(logEntry);
    }

    if (args.debug) {
      // 打印序列号方便debug
      console.log(picocolors.blue(`\ndebug log ${sn}`));

      fs.appendFileSync(logFile, logEntry);
    }
  }
}
