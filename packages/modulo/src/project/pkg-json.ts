import { expect } from "../tools/expect.ts";
import { json } from "../tools/json.ts";
import { resolve_and_read_file } from "../tools/file.ts";
import { project_root } from "./root.ts";

interface PackageJson {
  name: string;
  dependencies: Record<string, string>;
  scripts: undefined | Record<string, string>;
}

let pkg_json = undefined as PackageJson | undefined;

/**
 * 读取package.json
 */
export function get_pkg_json() {
  if (!pkg_json) {
    // biome-ignore lint/style/noNonNullAssertion: <panic if content nullable>
    const content = resolve_and_read_file(project_root, "package.json");
    pkg_json = json.parse<PackageJson>(content);

    expect(pkg_json && pkg_json.name).halt(
      "根目录下没有 package.json 或者 package.json 缺少name字段"
    );
  }
  return pkg_json!;
}
