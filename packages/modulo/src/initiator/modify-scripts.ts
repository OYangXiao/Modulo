import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";
import picocolors from "picocolors";
import { get_packagejson } from "../config/index.ts";

export const star_line = "**********************";

export async function modify_scripts() {
  const packagejson = get_packagejson();
  const new_scripts = {
    ...(packagejson.scripts || {}),
    "build:page": "modulo build page",
    "build:module": "modulo build module",
    "build:all": "modulo build all",
    build: "modulo build all",
    "dev:page": "modulo dev page",
    "dev:module": "modulo dev module",
    "watch:page": "modulo build page --watch=true",
    "watch:module": "modulo build module --watch=true",
  };
  console.log(
    picocolors.magentaBright(
      `\n${star_line}修改package.json中的scripts\n新的内容修改后如下:\n${JSON.stringify(
        new_scripts,
        null,
        2
      )}\n${star_line}`
    )
  );

  // 确定是否修改package.json
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await new Promise<string>((resolve) => {
    rl.question("\n确定修改吗？请输入(Y/N) ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
  if (answer.toLowerCase() !== "y") {
    console.log("取消修改");
    return;
  }

  packagejson.scripts = new_scripts;
  const new_packagejson = JSON.stringify(packagejson, null, 2);
  writeFileSync(resolve(process.cwd(), "package.json"), new_packagejson);
  console.log(picocolors.green(`\npackage.json修改成功`));
}
