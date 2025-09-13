import type minimist from 'minimist';
import picocolors from 'picocolors';
import { PANIC_IF } from '../tools/panic';

const mode_list = ['dev', 'development', 'prd', 'production'];

export function get_mode(argv: minimist.ParsedArgs, cmd: 'dev' | 'build') {
  // mode参数
  let mode = '' as 'dev' | 'prd';
  if (argv.mode) {
    if (argv.mode === 'dev' || argv.mode === 'development') {
      mode = 'dev';
    } else if (argv.mode === 'prd' || argv.mode === 'production') {
      mode = 'prd';
    } else {
      PANIC_IF(true, `mode参数只能为 ${mode_list.join(' 或 ')}`);
    }
    console.log(picocolors.blue(`mode = ${mode}`));
  } else if (cmd === 'build' || cmd === 'dev') {
    if (process.env.NODE_ENV) {
      mode = process.env.NODE_ENV === 'production' ? 'prd' : 'dev';
      console.log(
        picocolors.yellow('\n未设置mode，将根据process.env.NODE_ENV自动设置\n'),
        picocolors.yellow(`process.env.NODE_ENV = ${process.env.NODE_ENV}, mode = ${mode}`),
      );
    } else {
      mode = cmd === 'build' ? 'prd' : 'dev';
      console.log(
        picocolors.yellow('\n未设置mode，将根据build或dev命令自动设置\n'),
        picocolors.yellow(`cmd = ${cmd}, mode = ${mode}`),
      );
    }
  }

  return mode;
}
