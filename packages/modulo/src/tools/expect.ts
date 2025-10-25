import { exit } from "node:process";
import { verbose } from "./verbose.ts";

const alert_str = "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !";
const defaultMessage = "SOMETHING'S WRONG";

export function expect(condition: any) {
  function or_halt(msg = defaultMessage) {
    if (!condition) {
      verbose.warn(`\n${alert_str}\n\n${msg}\n\n${alert_str}`);
      exit(1);
    }
  }

  function or_throw(msg = defaultMessage) {
    if (!condition) {
      throw new Error(msg);
    }
  }

  return {
    verbose: (msg: string) => {
      verbose.info(msg);
      return { or_halt, or_throw };
    },
    or_halt,
    or_throw,
  };
}
