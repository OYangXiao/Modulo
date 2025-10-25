import * as fs from "node:fs";
import * as path from "node:path";
import { argv_debug, argv_verbose } from "../cli/args/resolve.ts";
import { lower_my_simple_name } from "../myself/name.ts";
import { verbose } from "./verbose.ts";

const log_file_path = path.join(
  process.cwd(),
  `${lower_my_simple_name}.debug.log`
);
const splitter = "====================";

// 日志的序列号
let index = 0;

function format_json(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return `${String(obj)}[object cannot be stringified]`;
  }
}

export function debug_log(hint: string, ...params: any) {
  if (!argv_debug && !argv_verbose) return;

  const timestamp = new Date().toISOString();
  const sn = String(index++).padStart(3, "0");
  const content = params
    .map((p: unknown) => (typeof p === "object" ? format_json(p) : String(p)))
    .join("\n");
  const log_entry = `${splitter}\n${sn} [${timestamp}] ${hint}\n${content}\n${splitter}`;

  if (argv_verbose) {
    console.log(log_entry);
  }

  if (argv_debug) {
    // 打印序列号方便debug
    verbose.info(`\ndebug log ${sn}`);

    fs.appendFile(log_file_path, log_entry, (err) => {
      if (err) {
        verbose.error("无法写入debug日志文件:");
        console.error(err);
      }
    });
  }
}
