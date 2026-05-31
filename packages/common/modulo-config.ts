/**
 * 默认的配置文件名（项目根目录下）。
 */
export const DEFAULT_CONFIG_FILE_NAME = 'modulo.config.ts';

export type ExternalsType = 'importmap' | 'script';

export type ExternalConfig = Record<string, unknown>;

export type AliasConfig = Record<string, string>;

export type DevServerProxyConfig = Record<string, unknown>;

export interface DevServerConfig {
  open: false | string[];
  port: number;
  proxy: DevServerProxyConfig;
}

export type HtmlTag = Record<string, unknown>;

export interface HtmlConfig {
  root: string;
  title: string;
  template: string;
  meta: Record<string, string>;
  tags: HtmlTag[];
}

export interface InputConfig {
  src: string;
  pages: string;
  modules: string;
  entries: Record<string, string>;
}

export interface OutputConfig {
  filenameHash: boolean;
  distPath: string;
  pages: string;
  modules: string;
}

export interface UrlConfig {
  base: string;
  cdn: string;
}

export interface UserConfig {
  input?: Partial<InputConfig>;
  output?: Partial<OutputConfig>;
  url?: Partial<UrlConfig>;
  alias?: AliasConfig;
  autoExternal?: boolean;
  externalsType?: ExternalsType;
  html?: Partial<HtmlConfig>;
  dev_server?: Partial<DevServerConfig>;
  externals?: ExternalConfig;
  [key: string]: unknown;
}

/**
 * 创建默认用户配置对象。
 *
 * CLI 在 `modulo config init` 生成配置文件时会以该对象为来源。
 */
export function createDefaultUserConfig(): UserConfig {
  return {
    input: {
      src: 'src',
      pages: 'pages',
      modules: 'modules',
      entries: {},
    },
    output: {
      filenameHash: true,
      distPath: 'dist',
      pages: '',
      modules: 'modules',
    },
    url: {
      base: '/',
      cdn: '',
    },
    alias: {
      '@': '{input.src}',
    },
    autoExternal: true,
    externalsType: 'script',
    html: {
      root: 'app',
      title: '',
      template: '',
      meta: {},
      tags: [],
    },
    dev_server: {
      open: false,
      port: 8080,
      proxy: {},
    },
    externals: {},
  };
}
