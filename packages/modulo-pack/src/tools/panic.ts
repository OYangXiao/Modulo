import { exit } from 'node:process';

const alert = '\n! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !\n';

export function PANIC_IF(status = false, msg = `SOMETHING'S WRONG`, halt = false): asserts status is false {
  if (status) {
    console.error(`${alert}${msg}${alert}`);
    if (halt) {
      exit(1);
    }
  }
}
