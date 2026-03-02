import type { Compiler, Compilation } from "@rspack/core";
import type { ModuloArgs_Pack } from "../args/index.ts";
import type { GLOBAL_CONFIG } from "../config/type.ts";
import { getExternalsAndImportMap } from "./get-externals-and-tags.ts";

/**
 * 自动 External 插件
 * 
 * 1. 扫描编译过程中使用到的 node_modules 依赖
 * 2. 如果这些依赖在 config.externals 中定义了，则标记为已使用
 * 3. 在 HTML 生成阶段，仅注入已使用的依赖的 importmap 或 script 标签
 */
export class AutoExternalPlugin {
  private externalLibNames: string[];
  private usedExternals: Set<string>;
  private args: ModuloArgs_Pack;
  private config: GLOBAL_CONFIG;

  constructor(args: ModuloArgs_Pack, config: GLOBAL_CONFIG) {
    this.args = args;
    this.config = config;
    this.externalLibNames = Object.keys(config.externals);
    this.usedExternals = new Set<string>();
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap("AutoExternalPlugin", (compilation: Compilation) => {
      // 1. 扫描模块依赖
      compilation.hooks.finishModules.tap("AutoExternalPlugin", (modules) => {
        for (const module of modules) {
          // 检查 module.resource 是否包含 node_modules
          // 并且属于我们在 config.externals 中定义的包
          const resource = (module as any).resource;
          if (resource && resource.includes("node_modules")) {
            for (const libName of this.externalLibNames) {
              // 简单的包含匹配，更严谨的可以使用路径解析
              // 例如: /node_modules/vue/
              // 这里简化处理，匹配 /node_modules/<libName>/
              if (
                resource.includes(`/node_modules/${libName}/`) ||
                resource.includes(`\\node_modules\\${libName}\\`)
              ) {
                this.usedExternals.add(libName);
              }
            }
          }
        }
      });

      // 2. 注入 HTML
      const HtmlWebpackPlugin =
        compiler.webpack.HtmlWebpackPlugin ||
        compiler.options.plugins.find(
          (p: any) => p.constructor.name === "HtmlWebpackPlugin"
        )?.constructor;
      
      if (!HtmlWebpackPlugin) return;

      const hooks = (HtmlWebpackPlugin as any).getHooks(compilation);
      hooks.alterAssetTags.tap("AutoExternalPlugin", (data: any) => {
        if (!this.config.autoExternal) return data;

        // 重新计算 importmaps
        const { importMap } = getExternalsAndImportMap(
          this.args,
          this.config.externals,
          this.config.externalsType
        );

        // 过滤未使用的依赖
        const filteredImportMap = Object.fromEntries(
          Object.entries(importMap).filter(([key]) => this.usedExternals.has(key))
        );

        if (Object.keys(filteredImportMap).length === 0) return data;

        let tags: any[] = [];
        if (this.config.externalsType === "script") {
          tags = Object.values(filteredImportMap).map((url) => ({
            tagName: "script",
            voidTag: false,
            attributes: { src: url },
          }));
        } else {
          tags = [
            {
              tagName: "script",
              voidTag: false,
              attributes: { type: "importmap" },
              innerHTML: JSON.stringify({ imports: filteredImportMap }, null, 2),
            },
          ];
        }

        // 插入到 head 的最前面
        data.assetTags.scripts.unshift(...tags);
        return data;
      });
    });
  }
}
