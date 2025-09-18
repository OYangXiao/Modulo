import { get_packagejson } from "../config/index.ts";
import { get_framework_name } from "../tools/get-framework-name.ts";
import { PANIC_IF } from "../tools/panic.ts";
import semver from "semver";

export function detect_preset() {
  const { dependencies } = get_packagejson();

  const framework_name = get_framework_name();
  const version = semver.parse(dependencies[framework_name])!;

  PANIC_IF(!version, `package.json中未识别到${framework_name}的版本信息`);

  //需要识别

  const preset = `${framework_name}${version.major}`;

  return preset;
}
