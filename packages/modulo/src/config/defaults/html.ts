export interface TagAttr {
  src?: string;
  defer?: boolean;
  type?: string;
  link?: string;
}
export interface Tag {
  append?: boolean;
  attrs?: TagAttr;
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
  tags: [
    {
      append: false,
      attrs: { src: '/common/js/webhost.js' },
      hash: false,
      head: true,
      publicPath: true,
      tag: 'script',
    },
  ] as Tag[],
  template: '', // html模板的路径
  title: '', // html标题
};

export type HTML_CONFIG = typeof default_html_config;
