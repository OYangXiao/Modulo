import picocolors from 'picocolors';

export function jsonparse<T>(input: string) {
  try {
    if (input) {
      return JSON.parse(input) as T;
    }
  } catch (e) {
    console.error(picocolors.red(`JSON.parse failed\n${e}`));
  }
}
