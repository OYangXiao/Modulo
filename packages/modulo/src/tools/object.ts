export function object<T extends Record<string, any>>(obj: T) {
  return {
    get(key: string) {
      return obj[key] as T[keyof T] | undefined;
    },
  };
}
