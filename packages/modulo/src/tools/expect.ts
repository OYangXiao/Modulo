import { exit } from "node:process";
import pc from "picocolors";

const alert = "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !";
const defaultMessage = "SOMETHING'S WRONG";

export function expect(condition: boolean) {
  return {
    or: <T>(messageOrAction: T | (() => T)): T => {
      if (!condition) {
        if (typeof messageOrAction === "function") {
          return (messageOrAction as () => T)();
        } else {
          return messageOrAction;
        }
      }
    },

    halt: (msg: string): never => {
      const message = msg || defaultMessage;
      console.log(
        pc.bgRed(pc.white(`\n${alert}\n\n${message}\n\n${alert}`)),
        "\n"
      );
      exit(1);
    },

    silent: (): boolean => condition,
  };
}
