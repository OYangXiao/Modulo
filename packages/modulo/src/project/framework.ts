import { expect } from "../tools/expect.ts";
import { get_pkg_json } from "./pkg-json.ts";

export function get_framework() {
  const { dependencies } = get_pkg_json();

  expect("vue" in dependencies || "react" in dependencies).halt(
    "package.json中未识别到支持的ui库信息, 当前只支持vue和react"
  );

  // 该项目是vue还是react项目
  return "vue" in dependencies ? "vue" : "react";
}
