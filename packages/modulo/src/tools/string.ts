export function first_letter_upper(str: string) {
  return `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
}
