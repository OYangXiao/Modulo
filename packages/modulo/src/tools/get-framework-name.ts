import { get_packagejson } from "../config/index.ts";
import { expect } from "./expect.ts";

export function get_framework_name() {
  const { dependencies } = get_packagejson();

  expect(
    !("vue" in dependencies || "react" in dependencies),
    "package.json中未识别到支持的ui库信息, 当前只支持vue和react"
  );

  // 该项目是vue还是react项目
  return "vue" in dependencies ? "vue" : "react";
}
