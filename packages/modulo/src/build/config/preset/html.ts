export interface Tag {
  append?: boolean;
  attrs?: Record<string, string>;
  children?: string;
  hash?: boolean | string;
  head?: boolean;
  publicPath?: string | boolean;
  tag: string;
}

export const default_html_config = {
  meta: {} as Record<string, string>,
  root: '', // html挂载点id, 只允许id
  tags: [] as Tag[],
  template: '', // html模板的路径
  title: '', // html标题
};

export type HTML_CONFIG = typeof default_html_config;
