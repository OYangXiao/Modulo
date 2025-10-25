import { verbose } from "./verbose.ts";

export const json = {
  parse<T>(input: string) {
    try {
      if (input) {
        return JSON.parse(input) as T;
      }
    } catch (e) {
      verbose.error(`JSON.parse failed\n${e}`);
    }
  },
};
