const SECRET_KEY = /(?:authorization|cookie|credential|password|passwd|secret|token|api[-_]?key|private[-_]?key)/i;

export function redact<T>(value: T, seen = new WeakSet<object>()): T {
  if (Array.isArray(value)) return value.map((item) => redact(item, seen)) as T;
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]" as T;
  seen.add(value);

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    result[key] = SECRET_KEY.test(key) ? "[REDACTED]" : redact(nested, seen);
  }
  seen.delete(value);
  return result as T;
}
