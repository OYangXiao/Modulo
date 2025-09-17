import type minimist from "minimist";
import picocolors from "picocolors";
import { PANIC_IF } from "../tools/panic.ts";

const mode_list = ["dev", "development", "prd", "production"];

export function get_env(argv: minimist.ParsedArgs, cmd: "dev" | "build") {
  // mode参数
  let env = "" as "dev" | "prd";
  if (argv.env) {
    if (argv.env === "dev" || argv.env === "development") {
      env = "dev";
    } else if (argv.env === "prd" || argv.env === "production") {
      env = "prd";
    } else {
      PANIC_IF(true, `env参数只能为 ${mode_list.join(" 或 ")}`);
    }
    console.log(picocolors.blue(`env = ${env}`));
  } else if (cmd === "build" || cmd === "dev") {
    if (process.env.NODE_ENV) {
      env = process.env.NODE_ENV === "production" ? "prd" : "dev";
      console.log(
        picocolors.yellow("\n未设置env，将根据process.env.NODE_ENV自动设置\n"),
        picocolors.yellow(
          `process.env.NODE_ENV = ${process.env.NODE_ENV}, env = ${env}`
        )
      );
    } else {
      env = cmd === "build" ? "prd" : "dev";
      console.log(
        picocolors.yellow("\n未设置env，将根据build或dev命令自动设置\n"),
        picocolors.yellow(`cmd = ${cmd}, env = ${env}`)
      );
    }
  }

  return env;
}
