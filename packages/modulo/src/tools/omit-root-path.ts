const root_path = process.cwd();
export function omit_root_path(path: string) {
  // return relative path
  return path.replace(root_path, "");
}

export function omit_root_path_for_entries(entries: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, omit_root_path(value)])
  );
}
