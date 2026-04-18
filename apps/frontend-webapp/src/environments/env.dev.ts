export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  /**
   * Cloudflare Turnstile public site key.
   *
   * The key below is Cloudflare's official "always passes" test key —
   * it renders a widget that auto-solves without network calls. Use it
   * for local dev and CI. Real site keys go in env.prod.ts only.
   *
   * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
   */
  turnstileSiteKey: '1x00000000000000000000AA',
};
