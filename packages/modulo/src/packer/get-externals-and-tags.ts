import type { ModuloArgs_Pack } from "../args/index.ts";
import {
  type ExternalLibs,
  type ConfigExternalUrl,
  type ImportExternal,
} from "../config/type.ts";
import {
  is_env_external,
  is_string,
  is_import_external,
} from "../type/guard.ts";

function getExternalUrl(args: ModuloArgs_Pack, url: ConfigExternalUrl) {
  let resolvedUrl = url;
  while (!is_string(resolvedUrl)) {
    if (is_env_external(resolvedUrl)) {
      resolvedUrl = resolvedUrl[args.pack.env];
    } else {
      // 理论上不会走到这里，因为现在只有 string 和 EnvExternalUrl
      // 但为了类型安全，还是保留一个 else 分支或者抛出错误
      return undefined;
    }
  }
  return resolvedUrl;
}

/**
 * 解析 External 配置，生成 externals 对象和 importMap
 * @param args CLI 参数
 * @param externalLibs 外部依赖配置
 * @param externalsType External 类型（importmap 或 script）
 * @returns externals 和 importMap
 */
export function getExternalsAndImportMap(
  args: ModuloArgs_Pack,
  externalLibs: ExternalLibs,
  externalsType: "importmap" | "script" = "importmap"
) {
  return Object.entries(externalLibs).reduce(
    ({ externals, importMap }, [libName, data]) => {
      // 归一化为GlobalExternal或者ImportExternal
      const externalData = is_env_external(data) ? data[args.pack.env] : data;
      
      let externalLib: ImportExternal;
      
      if (typeof externalData === "string") {
        externalLib = { url: externalData };
      } else {
        // 此时 externalData 已经是 ImportExternal 类型
        externalLib = externalData as ImportExternal;
      }

      const url = getExternalUrl(args, externalLib.url);
      
      if (externalsType === "script") {
        // Script 模式：external 映射为全局变量
        const globalVar = externalLib.global || libName;
        const importName = externalLib.importName || libName;
        (Array.isArray(importName) ? importName : [importName]).forEach(
          (name) => (externals[name] = globalVar)
        );
        
        if (url) {
            importMap[libName] = url; // 复用 importMap 存储 URL，但在 prepare 中会生成 script 标签
        }
      } else {
        // Importmap 模式：external 映射为包名（由 importmap 解析）
        const importName = externalLib.importName || libName;
        (Array.isArray(importName) ? importName : [importName]).forEach(
          (name) => (externals[name] = libName)
        );

        if (url) {
          importMap[libName] = url;
        }
      }

      return {
        externals,
        importMap,
      };
    },
    {
      externals: {} as Record<string, string>,
      importMap: {} as Record<string, string>,
    }
  );
}
