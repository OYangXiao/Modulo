import type { ModuloArgs_Pack } from "../args/index.ts";
import {
  is_env_external,
  type ExternalLibs,
  is_global_external,
  type ImportExternal,
  is_module_typed_external_url,
  type GlobalExternal,
  type ModuleTypedExternalUrl,
  type ConfigExternalUrl,
} from "../config/externals.ts";
import type { Tag } from "../config/preset/html.ts";
import { is_string } from "../type/guard.ts";

function get_external_url(args: ModuloArgs_Pack, url: ConfigExternalUrl) {
  let _url = url;
  while (!is_string(_url)) {
    if (is_env_external(_url)) {
      _url = _url[args.pack.env];
    } else {
      const mode = args.pack.esm ? "esm" : "umd";
      _url = mode in _url ? (_url as any)[mode] : undefined;
    }
  }
  return _url;
}

export function get_externals_and_tags(
  args: ModuloArgs_Pack,
  external_list: ExternalLibs
) {
  return Object.entries(external_list).reduce(
    ({ externals, importmaps, iife_tags }, [lib_name, data]) => {
      // 归一化为GlobalExternal或者ImportExternal
      // 此处类型推导有问题，因此手动断言
      const _data = (is_env_external(data) ? data[args.pack.env] : data) as
        | string
        | GlobalExternal
        | ImportExternal
        | ModuleTypedExternalUrl;
      const external_lib = (
        typeof _data === "string"
          ? ({
              url: { esm: _data, umd: _data } as ModuleTypedExternalUrl,
            } as ImportExternal)
          : is_module_typed_external_url(_data)
          ? ({ url: _data } as ImportExternal)
          : _data
      ) as GlobalExternal | ImportExternal;

      // 合并externals，以剔除打包内容
      const _importName = external_lib.importName || lib_name;
      (Array.isArray(_importName) ? _importName : [_importName]).forEach(
        (name) => (externals[name] = lib_name)
      );

      const url = get_external_url(args, external_lib.url);
      // 如果有external的url
      if (url) {
        if (is_global_external(external_lib)) {
          // 如果是全局的，则添加到iife_tags中
          iife_tags.push({
            append: false,
            head: true,
            tag: "script",
            attrs: {
              src: get_external_url(args, external_lib.url),
            },
          });
          return { externals, importmaps, iife_tags };
        } else {
          // 如果是import的，加入到importmaps
          importmaps[lib_name] = url;
        }
      }

      return {
        externals,
        importmaps,
        iife_tags,
      };
    },
    {
      externals: {} as Record<string, string>,
      importmaps: {} as Record<string, string>,
      iife_tags: [] as Tag[],
    }
  );
}
