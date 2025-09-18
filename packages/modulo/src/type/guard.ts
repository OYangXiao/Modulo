export function is_string(data: unknown): data is string {
  return typeof data === "string";
}

export function is_true_string(data: unknown): data is string {
  return typeof data === "string" && !!data;
}

export function is_record(data: unknown): data is Record<string, unknown> {
  return !!data && typeof data === "object";
}
