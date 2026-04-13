/**
 * Checks whether a user-held permission matches a required permission.
 *
 * Uses segment-based matching on `:` delimiter:
 * - `"*"` matches everything
 * - `"music:*"` matches `"music:playlist:read"`, `"music:setlist:write"`, etc.
 * - `"music:playlist:*"` matches `"music:playlist:read"` and `"music:playlist:write"`
 * - Exact match: `"music:playlist:read"` matches only itself
 *
 * @param held - The permission the user holds (may contain wildcards)
 * @param required - The permission required for the action (never contains wildcards)
 * @returns true if `held` covers `required`
 */
export function wildcardMatch(held: string, required: string): boolean {
  if (held === '*') return true;
  if (held === required) return true;

  const heldParts = held.split(':');
  const requiredParts = required.split(':');

  for (let i = 0; i < heldParts.length; i++) {
    if (heldParts[i] === '*') return true;
    if (heldParts[i] !== requiredParts[i]) return false;
  }

  // held has fewer segments than required and no wildcard was hit
  return heldParts.length === requiredParts.length;
}

/**
 * Checks whether a set of held permissions satisfies a required permission.
 */
export function hasPermission(held: string[], required: string): boolean {
  return held.some((p) => wildcardMatch(p, required));
}
