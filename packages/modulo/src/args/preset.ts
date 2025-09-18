import type minimist from "minimist";
import picocolors from "picocolors";
import { get_framework_name } from "../tools/get-framework-name.ts";
import { PANIC_IF } from "../tools/panic.ts";

export function get_preset_for_init(argv: minimist.ParsedArgs) {
  let preset = argv.preset;

  if (!preset) {
    preset = get_framework_name();
    console.log(
      picocolors.blue(
        "未输入preset，但是根据package.json中的依赖自动识别到preset为: " +
          preset
      )
    );
  }

  preset &&
    PANIC_IF(preset !== "react" && preset !== "vue", "目前只支持react和vue");

  return preset;
}
