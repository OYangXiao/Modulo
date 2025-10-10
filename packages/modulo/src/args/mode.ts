import type minimist from "minimist";
import picocolors from "picocolors";
import { expect } from "../tools/expect.ts";

const mode_list = ["dev", "development", "prd", "production"];

export function get_env(argv: minimist.ParsedArgs, cmd: "dev" | "build") {
  // env参数
  let env = "" as "dev" | "prd";

  // 如果传了env参数，则以传入的参数为准
  if (argv.env) {
    if (argv.env === "dev" || argv.env === "development") {
      env = "dev";
    } else if (argv.env === "prd" || argv.env === "production") {
      env = "prd";
    } else {
      expect(false).halt(`env参数只能为 ${mode_list.join(" 或 ")}`);
    }
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = env === "prd" ? "production" : "development";
    }
    console.log(
      picocolors.blue(
        `env = ${env}, 来自命令行参数\nprocess.env.NODE_ENV = ${process.env.NODE_ENV}`
      )
    );
  } else if (cmd === "build" || cmd === "dev") {
    if (process.env.NODE_ENV) {
      // 如果没有传env参数，则根据process.env.NODE_ENV来设置
      env = process.env.NODE_ENV === "production" ? "prd" : "dev";
      console.log(
        picocolors.yellow(
          `\n未设置env，检测到process.env.NODE_ENV，env将与之保持一致\nprocess.env.NODE_ENV = ${process.env.NODE_ENV}, env = ${env}`
        )
      );
    } else {
      // 如果两者都没有设置，则根据cmd来设置
      env = cmd === "build" ? "prd" : "dev";
      process.env.NODE_ENV = env === "prd" ? "production" : "development";
      console.log(
        picocolors.yellow(
          `\n未设置env和process.env.NODE_ENV，将根据build或dev命令自动设置\ncmd = ${cmd}, env = ${env}, process.env.NODE_ENV = ${process.env.NODE_ENV}`
        )
      );
    }
  }

  return env;
}
