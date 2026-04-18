export const environment = {
  production: true,
  apiBaseUrl: 'https://api.monapp.com',
  /**
   * Cloudflare Turnstile public site key.
   *
   * Replace with the production site key from the Cloudflare dashboard
   * (https://dash.cloudflare.com/?to=/:account/turnstile) before shipping.
   * This value IS public — it is safe to commit and visible in the DOM.
   */
  turnstileSiteKey: 'REPLACE_WITH_PROD_TURNSTILE_SITE_KEY',
};
