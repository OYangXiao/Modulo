import type { ModuloArgs_Pack } from "../args/index.ts";
import type { LibExternal } from "../config/example/example-externals.ts";
import type { HTML_CONFIG, Tag } from "../config/preset/html.ts";
import { get_external_url } from "./get-external-url.ts";

export function get_externals_and_tags(
  args: ModuloArgs_Pack,
  external_list: LibExternal[]
) {
  return external_list.reduce((externals, external) => {
    const importNames = Array.isArray(external.importName)
      ? external.importName
      : [external.importName];
    importNames.forEach((importName) => {
      externals[importName] = external.name;
    });

    return externals;
  }, {} as Record<string, string>);
}
