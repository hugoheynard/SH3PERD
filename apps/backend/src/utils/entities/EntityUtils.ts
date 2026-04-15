export class EntityUtils {
  /* ---------- Utils ---------- */

  private static canonicalize(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => EntityUtils.canonicalize(item));
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      const out: Record<string, unknown> = {};

      for (const k of keys) {
        out[k] = EntityUtils.canonicalize(record[k]);
      }
      return out;
    }
    // primitives (string, number, boolean, bigint, symbol)
    return value;
  }

  private static isEqual(a: unknown, b: unknown): boolean {
    return (
      JSON.stringify(EntityUtils.canonicalize(a)) === JSON.stringify(EntityUtils.canonicalize(b))
    );
  }

  //TODO : separate deepDiff et mongo dot path, with a dot path mapper to remove coupling with mongo
  static deepDiffToDotSet(
    original: Record<string, unknown> = {},
    updated: Record<string, unknown> = {},
  ): Record<string, unknown> {
    const changes: Record<string, unknown> = {};

    const isObject = (v: unknown): v is Record<string, unknown> =>
      Boolean(v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date));

    const walk = (path: string, a: unknown, b: unknown): void => {
      // both objects -> recurse
      if (isObject(a) && isObject(b)) {
        const subKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of subKeys) {
          walk(path ? `${path}.${k}` : k, a[k], b[k]);
        }
        return;
      }

      // arrays: treat as unit
      if (Array.isArray(a) || Array.isArray(b)) {
        if (!EntityUtils.isEqual(a, b)) {
          changes[path] = b;
        }
        return;
      }

      // Dates and primitives
      if (!EntityUtils.isEqual(a, b)) {
        changes[path] = b;
      }
    };

    const rootKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);
    for (const k of rootKeys) {
      walk(k, original[k], updated[k]);
    }

    return changes;
  }
}
