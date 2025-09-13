import type minimist from 'minimist';
import { PANIC_IF } from '../tools/panic.ts';

// 命令
export function get_cmd(argv: minimist.ParsedArgs) {
  const cmd_list = ['build', 'dev', 'create-config'] as const;
  const cmd = argv._[0] as (typeof cmd_list)[number];
  PANIC_IF(!cmd_list.includes(cmd), `modulo必须执行 ${cmd_list.join(' 或 ')} 命令`);
  return cmd;
}
