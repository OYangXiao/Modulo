import picocolors from "picocolors";
import type { Modulo_Build_Args } from "../cli/args/resolve.ts";
import { collect_modules } from "./collect-modules.ts";
import { omit_root_path_for_entries } from "./omit-root-path.ts";
import { get_externals_importmaps } from "./get-externals-and-tags.ts";
import type { GLOBAL_CONFIG } from "./config/type.ts";

let printed = false;

export function prepare_config(
  args: Modulo_Build_Args,
  kind: "page" | "module",
  config: GLOBAL_CONFIG
) {
  const { externals, importmaps } = get_externals_importmaps(
    args,
    config.externals
  );

  !printed &&
    console.log(
      `${picocolors.blue("\nexternals:")}\n${JSON.stringify(
        externals,
        null,
        2
      )}\n`
    );

  if (kind === "page") {
    console.log(
      `${picocolors.blue("html_tags:")}\n${JSON.stringify(
        config.html.tags,
        null,
        2
      )}\n`
    );
  }

  const importmaps_tag = {
    append: false,
    head: true,
    tag: "script",
    attrs: { type: args.build.esm ? "importmap" : "systemjs-importmap" },
    children: `{
         "imports": ${JSON.stringify(importmaps, null, 2)}
      }`,
  };

  !printed &&
    console.log(
      `${picocolors.blue("\nimportmaps:")}\n${JSON.stringify(
        importmaps,
        null,
        2
      )}\n`
    );

  printed = true;

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

  return { entries, externals, importmaps_tag };
}
