import { resolve } from "node:path";
import picocolors from "picocolors";
import { get_packagejson } from "../config/index.ts";
import { confirm } from "../tools/cli.ts";
import { update_json_file } from "../tools/json.ts";

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
  const confirmed = await confirm("\n确定修改吗？");
  if (!confirmed) {
    console.log("取消修改");
    return;
  }

  const success = update_json_file(
    resolve(process.cwd(), "package.json"),
    (data: any) => {
      data.scripts = new_scripts;
      return data;
    }
  );

  if (success) {
    console.log(picocolors.green(`\npackage.json修改成功`));
  } else {
    console.log(picocolors.red(`\npackage.json修改失败`));
  }
}
