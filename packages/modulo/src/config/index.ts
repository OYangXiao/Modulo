import { resolve_and_read } from "../tools/file.ts";
import { jsonparse } from "../tools/json.ts";
import { expect } from "../tools/expect.ts";
import { root } from "./merge-config.ts";

interface PackageJson {
  name: string;
  dependencies: Record<string, string>;
  scripts: undefined | Record<string, string>;
}
/**
 * 读取package.json
 */
let packagejson = null as PackageJson | null;
export function get_packagejson() {
  if (!packagejson) {
    // biome-ignore lint/style/noNonNullAssertion: <panic if content nullable>
    packagejson = jsonparse<PackageJson>(
      resolve_and_read(root, "package.json")
    )!;
    expect(!packagejson, "根目录下没有package.json");
    expect(!packagejson.name, "package.json缺少name字段");
  }
  return packagejson;
}

export { merge_config as get_global_config } from "./merge-config.ts";
