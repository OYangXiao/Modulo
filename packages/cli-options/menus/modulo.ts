import type { CliRuntimeContext, MenuDefinition } from '@yannick-z/modulo-cli-framework';
import { createBuildOption } from './build.ts';
import { createConfigOption } from './config.ts';
import { createDetectOption } from './detect.ts';
import { createDevOption } from './dev.ts';
import { createEnvOption } from './env.ts';
import { createInitOption } from './init.ts';

/**
 * modulo 的 CLI 选项配置（用于驱动 CLI 框架的交互菜单与命令分发）。
 */
export const moduloCliOptions: MenuDefinition<CliRuntimeContext> = {
  title: 'modulo',
  options: [
    createDetectOption(),
    createEnvOption(),
    createDevOption(),
    createBuildOption(),
    createInitOption(),
    createConfigOption(),
    {
      input: '0',
      name: 'exit',
      desc: '退出',
      func(ctx) {
        ctx.exit();
      },
    },
  ],
};
