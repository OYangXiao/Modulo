import { exit } from 'node:process';

export function if_then_alert_and_exit(status: boolean, msg: string): asserts status is false {
  if (status) {
    const alert = '\n\n！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！\n\n';
    console.error(`${alert}${msg}${alert}`);
    exit(1);
  }
}
