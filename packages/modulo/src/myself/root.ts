import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { debug_log } from "../tools/log-debug.ts";

// 本工具被安装到node_modules之后的根目录

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = dirname(__filename); // get the name of the directory

let current_dir = path.resolve(__dirname);
const root = path.parse(current_dir).root;

while (current_dir !== root) {
  const potential_pkg_json = path.join(current_dir, "package.json");
  if (fs.existsSync(potential_pkg_json)) {
    break;
  }
  current_dir = path.dirname(current_dir);
}

debug_log("package root", current_dir);

export const my_root = current_dir;
