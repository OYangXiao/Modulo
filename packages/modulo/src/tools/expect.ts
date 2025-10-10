import { exit } from "node:process";
import pc from "picocolors";

const alert_str = "! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !";
const defaultMessage = "SOMETHING'S WRONG";

export function expect(condition: boolean) {
  function alert(msg = defaultMessage) {
    if (condition) return true;
    console.log(pc.bgRed(pc.white(`\n${alert_str}\n\n${msg}\n\n${alert_str}`)), "\n");
  }
  return {
    alert,
    halt: (msg = defaultMessage) => {
      if (!alert(msg)) exit(1);
    },
  };
}
