import type { LibExternal } from '../config/defaults/externals.ts';
import type { HTML_CONFIG, Tag } from '../config/defaults/html.ts';

let external_and_tags: { externals: Record<string, string>; htmlTags: HTML_CONFIG['tags'] };

export function get_externals_and_tags(external_list: LibExternal[]) {
  if (!external_and_tags) {
    external_and_tags = external_list.reduce(
      ({ externals, htmlTags }, external) => {
        const importNames = Array.isArray(external.importName) ? external.importName : [external.importName];
        importNames.forEach((importName) => {
          externals[importName] = external.global;
        });
        htmlTags.push({
          append: false,
          attrs: { src: external.url },
          hash: false,
          head: true,
          publicPath: external.publicPath,
          tag: 'script',
        } as Tag);
        return {
          externals,
          htmlTags,
        };
      },
      { externals: {} as Record<string, string>, htmlTags: [] as HTML_CONFIG['tags'] },
    );
  }
  return external_and_tags;
}
