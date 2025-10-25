import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { debug_log } from "./log-debug.ts";
import { verbose } from "./verbose.ts";

export function read_file(path: string, error_msg?: string) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    verbose.error(error_msg || `文件无法访问或者不存在: ${path}`);
    return "";
  }
}

export function resolve_and_read_file(root: string, name: string) {
  const fullpath = resolve(root, name);
  debug_log(`resolve file: ${name}`, "result is:", fullpath);
  return read_file(fullpath);
}
