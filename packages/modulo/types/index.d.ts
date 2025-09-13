export {};

declare global {
  interface Dict<T = string> {
    [key: string]: T;
  }
  interface PackageJson {
    name: string;
    dependencies: Dict;
  }
}
