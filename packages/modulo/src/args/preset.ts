import type minimist from "minimist";
import picocolors from "picocolors";
import { detect_preset } from "./get-framework-name.ts";
import { expect } from "../tools/expect.ts";

export function get_preset_for_init(argv: minimist.ParsedArgs) {
  let preset = argv.preset;

  if (!preset) {
    preset = detect_preset();
    console.log(
      picocolors.blue(
        "未输入preset，但是根据package.json中的依赖自动识别到preset为: " +
          preset
      )
    );
  }

  preset &&
    expect(
      preset !== "react17" && preset !== "vue2",
      "目前只支持react17和vue2"
    );

  return preset;
}
