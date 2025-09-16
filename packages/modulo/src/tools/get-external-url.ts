import type { ModuloArgs_Pack } from "../args/index.ts";
import type { LibExternal } from "../config/example/example-externals.ts";

export function get_external_url(
  args: ModuloArgs_Pack,
  url: LibExternal["url"]
) {
  if (typeof url === "string") {
    return url;
  }
  if (typeof url === "object") {
    if (args.pack.mode in url) {
      return get_external_url(args, (url as any)[args.pack.mode]);
    }
    return (url as any)[args.pack.esm ? "esm" : "umd"];
  }
}
