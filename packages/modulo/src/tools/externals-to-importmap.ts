import type { ModuloArgs_Pack } from "../args/index.ts";
import type { LibExternal } from "../config/example/example-externals.ts";
import { get_external_url } from "./get-external-url.ts";

export function externals_to_importmap(
  args: ModuloArgs_Pack,
  externals: LibExternal[]
) {
  return `{
   "imports": {
     ${externals
       .map((external) => {
         const url = get_external_url(args, external.url);
         return url
           ? `"${external.name}": "${get_external_url(args, external.url)}"`
           : undefined;
       })
       .filter(Boolean)
       .join(",\n")}
   }
}`;
}
