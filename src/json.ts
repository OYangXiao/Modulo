export function jsonparse(input: string) {
  try {
    return JSON.parse(input);
  } catch (e) {
    console.error(`JSON.parse failed\n${e}`);
  }
}
