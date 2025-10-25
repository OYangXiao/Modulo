export const preset_dev_server_config = {
  open: false as false | string[], // dev时是否自动打开指定页面
  port: 8080, // 开发页面时, dev-server服务器端口
  proxy: {} as Record<string, string | { target: string; pathRewrite?: Record<string, string> }>, // dev时的代理配置
};
export type DEV_SERVER_CONFIG = typeof preset_dev_server_config;
