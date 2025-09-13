import { exit } from 'node:process';
import pc from 'picocolors';

const alert = '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !';

export function PANIC_IF(status = false, msg = `SOMETHING'S WRONG`, halt = true): asserts status is false {
  if (status) {
    console.log(pc.bgRed(pc.white(`\n${alert}\n\n${msg}\n\n${alert}`)), '\n');
    halt && exit(1);
  }
}
