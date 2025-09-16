// 在当前目录创建一份json配置文件
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";
import picocolors from "picocolors";
import { get_args } from "../args/index.ts";
import {
  default_config_file_name,
  get_example_config,
} from "../config/example/example-config.ts";

export async function create_config_file() {
  const args = get_args().create_config;

  const filename = args.name || default_config_file_name;
  console.log(picocolors.blue("即将创建配置文件"), filename);

  const filepath = resolve(process.cwd(), filename);

  if (existsSync(filepath)) {
    if (args.force) {
      console.log(picocolors.bgRed(picocolors.white("配置文件已存在，将覆盖")));
    } else {
      console.log(picocolors.red("配置文件已存在，是否覆盖？"));
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise<string>((resolve) => {
        rl.question("\n请输入(Y/N) ", (answer) => {
          rl.close();
          resolve(answer);
        });
      });
      if (answer.toLowerCase() !== "y") {
        console.log("取消创建");
        return;
      }
    }
  }

  writeFileSync(filepath, JSON.stringify(get_example_config(), null, 2));

  console.log(picocolors.green("创建成功"), filepath);
}
