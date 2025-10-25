import picocolor from "picocolors";
import { Colors } from "picocolors/types";

type PicoColor = Exclude<keyof Colors, "isColorSupported">;
type BgColor = PicoColor & `bg${string}`;
type TextColor = Exclude<PicoColor, BgColor>;

export const bold = "bold";
export const italic = "italic";
export const underline = "underline";
export const strikethrough = "strikethrough";
export const red = "red";
export const green = "green";
export const yellow = "yellow";
export const blue = "blue";
export const bgYellow = "bgYellow";
export const bgRed = "bgRed";
export const bgGreen = "bgGreen";
export const bgBlue = "bgBlue";

export function _verbose(
  config: Array<
    | TextColor
    | BgColor
    | typeof bold
    | typeof italic
    | typeof underline
    | typeof strikethrough
  >,
  message: string
) {
  const bold = config.includes("bold");
  const italic = config.includes("italic");
  const underline = config.includes("underline");
  const strikethrough = config.includes("strikethrough");
  const bg = config.find((c) => c.startsWith("bg"));
  const color = config.find((c) => !c.startsWith("bg") && c !== "bold");

  const bold_msg = bold ? picocolor.bold(message) : message;
  const italic_msg = italic ? picocolor.italic(bold_msg) : bold_msg;
  const underline_msg = underline
    ? picocolor.underline(italic_msg)
    : italic_msg;
  const strikethrough_msg = strikethrough
    ? picocolor.strikethrough(underline_msg)
    : underline_msg;
  const color_msg = color
    ? picocolor[color](strikethrough_msg)
    : strikethrough_msg;
  const bg_msg = bg ? picocolor[bg](color_msg) : color_msg;

  console.log(bg_msg);
}

export const verbose = {
  error(message: string) {
    _verbose([bold, red, bgYellow], `${message}\n`);
  },
  success(message: string) {
    _verbose([bold, green], `${message}\n`);
  },
  info(message: string) {
    _verbose([blue], `${message}\n`);
  },
  warn(message: string) {
    _verbose([bold, yellow], `${message}\n`);
  },
};
