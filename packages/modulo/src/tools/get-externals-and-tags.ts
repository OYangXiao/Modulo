import type { ModuloArgs_Pack } from "../args/index.ts";
import type { LibExternal } from "../config/example/example-externals.ts";
import type { HTML_CONFIG, Tag } from "../config/preset/html.ts";
import { get_external_url } from "./get-external-url.ts";

let external_and_tags: {
  externals: Record<string, string>;
  htmlTags: HTML_CONFIG["tags"];
};

export function get_externals_and_tags(
  args: ModuloArgs_Pack,
  external_list: LibExternal[]
) {
  if (!external_and_tags) {
    external_and_tags = external_list.reduce(
      ({ externals, htmlTags }, external) => {
        const importNames = Array.isArray(external.importName)
          ? external.importName
          : [external.importName];
        importNames.forEach((importName) => {
          externals[importName] = args.pack.esm
            ? external.name
            : external.global;
        });
        const external_url = get_external_url(args, external.url);
        if (external_url) {
          htmlTags.push({
            append: false,
            attrs: { src: external_url },
            hash: false,
            head: true,
            publicPath: external.publicPath,
            tag: "script",
          } as Tag);
        }
        return {
          externals,
          htmlTags,
        };
      },
      {
        externals: {} as Record<string, string>,
        htmlTags: [] as HTML_CONFIG["tags"],
      }
    );
  }
  return external_and_tags;
}
