import * as fs from "node:fs";
import * as path from "node:path";
import picocolors from "picocolors";

const logFile = path.join(process.cwd(), "modulo.debug.log");
let index = 0;

/**
 * 调试日志函数
 * 
 * 仅在 process.env.DEBUG 开启或 CLI 参数包含 --debug/--verbose 时输出。
 * - --verbose: 直接输出到控制台
 * - --debug: 输出日志文件到当前目录的 modulo.debug.log，并在控制台打印序号
 * 
 * @param hint 日志标题或提示信息
 * @param params 日志内容（可以是任意对象）
 */
export function debug_log(hint: string, ...params: unknown[]) {
  const argv_debug = process.env.DEBUG || process.argv.includes("--debug");
  const argv_verbose = process.argv.includes("--verbose") || process.argv.includes("-v");

  if (!argv_debug && !argv_verbose) {
    return;
  }

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
