import { resolve_and_read } from "../tools/file.ts";
import { jsonparse } from "../tools/json.ts";
import { PANIC_IF } from "../tools/panic.ts";
import { root } from "./generate_config.ts";

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
    PANIC_IF(!packagejson, "根目录下没有package.json");
    PANIC_IF(!packagejson.name, "package.json缺少name字段");
  }
  return packagejson;
}

export { get_global_config } from "./generate_config.ts";
