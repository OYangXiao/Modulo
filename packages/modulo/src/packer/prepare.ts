import picocolors from "picocolors";
import type { ModuloArgs_Pack } from "../args/index.ts";
import { collect_modules } from "./collect-modules.ts";
import { omit_root_path_for_entries } from "../tools/omit-root-path.ts";
import { getExternalsAndImportMap } from "./get-externals-and-tags.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";

let printed = false;

export function prepare_config(
  args: ModuloArgs_Pack,
  kind: "page" | "module",
  config: GLOBAL_CONFIG
) {
  console.log(picocolors.blueBright(`\n**** 开始构建 【${kind}】 ****`));
  const entries = collect_modules(args, kind);

  if (!entries) {
    console.log(picocolors.red(`\n没有要构建的${kind}，跳过\n`));
  } else {
    console.log(
      `${picocolors.blue(`\n${kind} entries:`)}\n${JSON.stringify(
        omit_root_path_for_entries(entries),
        null,
        2
      )}\n`
    );
  }

  const { externals, importMap } = getExternalsAndImportMap(
    args,
    config.externals,
    config.externalsType
  );

  !printed &&
    console.log(
      `${picocolors.blue("\nexternals:")}\n${JSON.stringify(
        externals,
        null,
        2
      )}\n`
    );

  let importMapsTag: any;

  if (config.externalsType === "script") {
    // script 注入模式，生成多个 script 标签
    importMapsTag = Object.values(importMap).map(url => ({
      tag: "script",
      attrs: { src: url },
      append: false,
      head: true,
    }));
  } else {
    // importmap 模式
    importMapsTag = [{
      append: false,
      head: true,
      tag: "script",
      attrs: { type: "importmap" },
      children: `{
            "imports": ${JSON.stringify(importMap, null, 2)}
        }`,
    }];
  }

  !printed &&
    console.log(
      `${picocolors.blue("\nimportmaps/scripts:")}\n${JSON.stringify(
        importMap,
        null,
        2
      )}\n`
    );

  printed = true;

  return { entries, externals, importMapsTag };
}
