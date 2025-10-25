import type minimist from "minimist";
import { expect } from "../../tools/expect.ts";
import { object } from "../../tools/object.ts";
import { verbose } from "../../tools/verbose.ts";

const mode_map = {
  dev: "dev",
  development: "dev",
  prd: "prd",
  production: "prd",
} as const;

export function get_mode(argv: minimist.ParsedArgs, cmd: "dev" | "build") {
  // mode参数
  let mode = "" as "dev" | "prd";

  // 如果传了env参数，则以传入的参数为准
  if (argv.env) {
    mode = object(mode_map).get(argv.env)!;
    expect(mode)
      .verbose(`mode = ${mode}, 来自命令行参数`)
      .or(`mode 参数只能为 ${Object.keys(mode_map).join(" 或 ")}`);
  } else {
    verbose.warn("\n未设置env参数, 将根据环境变量或命令自动设置");
    if (cmd === "build" || cmd === "dev") {
      if (process.env.NODE_ENV) {
        // 如果没有传env参数，则根据process.env.NODE_ENV来设置
        mode = process.env.NODE_ENV === "production" ? "prd" : "dev";
        verbose.warn(
          `\n未设置env，检测到process.env.NODE_ENV，env将与之保持一致\nprocess.env.NODE_ENV = ${process.env.NODE_ENV}, mode = ${mode}`
        );
      } else {
        // 如果两者都没有设置，则根据cmd来设置
        mode = cmd === "build" ? "prd" : "dev";
        process.env.NODE_ENV = mode === "prd" ? "production" : "development";
        console.log(
          picocolors.yellow(
            `\n未设置env和process.env.NODE_ENV，将根据build或dev命令自动设置\ncmd = ${cmd}, mode = ${mode}, process.env.NODE_ENV = ${process.env.NODE_ENV}`
          )
        );
      }
    }
  }

  process.env.NODE_ENV =
    process.env.NODE_ENV || (mode === "prd" ? "production" : "development");

  console.log(
    picocolors.blue(`process.env.NODE_ENV = ${process.env.NODE_ENV}`)
  );
  return mode;
}
