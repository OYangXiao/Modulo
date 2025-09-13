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
  meta: {
    viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover',
  } as Record<string, string>,
  root: 'app', // html挂载点id, 只允许id
  tags: [] as Tag[],
  template: '', // html模板的路径
  title: '', // html标题
};

export type HTML_CONFIG = typeof default_html_config;
