export class EntityUtils {

  /* ---------- Utils ---------- */

  private static canonicalize(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map(EntityUtils.canonicalize);
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value).sort();
      const out: Record<string, any> = {};

      for (const k of keys) {
        out[k] = EntityUtils.canonicalize(value[k]);
      }
      return out;
    }
    // primitives (string, number, boolean, bigint, symbol)
    return value;
  }

  private static isEqual(a: any, b: any): boolean {
    return JSON.stringify(EntityUtils.canonicalize(a)) === JSON.stringify(EntityUtils.canonicalize(b));
  };

  //TODO : separate deepDiff et mongo dot path, with a dot path mapper to remove coupling with mongo
  static deepDiffToDotSet(original: Record<string, any> = {}, updated: Record<string, any> = {}): Record<string, any> {
    const changes: Record<string, any> = {};

    const isObject = (v: any) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

    function walk(path: string, a: any, b: any) {
      // both objects -> recurse
      if (isObject(a) && isObject(b)) {
        const subKeys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
        for (const k of subKeys) {
          walk(path ? `${path}.${k}` : k, a?.[k], b?.[k]);
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
    }

    const rootKeys = new Set([...Object.keys(original || {}), ...Object.keys(updated || {})]);
    for (const k of rootKeys) {
      walk(k, original[k], updated[k]);
    }

    return changes;
  }
}