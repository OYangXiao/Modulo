import * as fs from "node:fs";
import * as path from "node:path";
import picocolors from "picocolors";
import { argv_debug, argv_verbose } from "../args/index.ts";

const logFile = path.join(process.cwd(), "modulo.debug.log");
let index = 0;

let debug_log_function: (hint: string, ...params: any) => void;

export function debug_log(_hint: string, ..._params: any) {
  if (!debug_log_function) {
    debug_log_function = (hint: string, ...params: any) => {
      if (argv_debug || argv_verbose) {
        const timestamp = new Date().toISOString();
        const sn = String(index++).padStart(3, "0");
        const logEntry = `--------------\n${sn} [${timestamp}] ${hint}\n${params
          .map((p: unknown) =>
            typeof p === "object" ? JSON.stringify(p, null, 2) : String(p)
          )
          .join("\n")}\n---------------\n\n`;

        if (argv_verbose) {
          console.log(logEntry);
        }

        if (argv_debug) {
          // 打印序列号方便debug
          console.log(picocolors.blue(`\ndebug log ${sn}`));

          fs.appendFileSync(logFile, logEntry);
        }
      }
    };
  }
  debug_log_function(_hint, ..._params);
}
