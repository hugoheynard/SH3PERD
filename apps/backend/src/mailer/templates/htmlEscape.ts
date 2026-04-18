/**
 * Minimal HTML escape for text injected into transactional templates.
 *
 * The only attacker-controlled field we currently interpolate is `firstName`
 * (user-supplied at registration). URLs are generated server-side from
 * cryptographically random tokens and never contain user input. Still, we
 * escape everything we interpolate — cheap and keeps future templates safe
 * by default.
 *
 * Scope: body text nodes only. Do NOT use this for attribute values in
 * unquoted contexts, JS strings, or CSS — those need their own escaping
 * rules. Every template here interpolates inside quoted attributes or text
 * nodes, so this covers us.
 */
export const htmlEscape = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
