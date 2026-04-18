/**
 * Cloudflare Turnstile client-side API types.
 *
 * Only the surface we actually use is typed. The full API lives at
 * https://developers.cloudflare.com/turnstile/reference/client-side-rendering/
 */

export type TurnstileTheme = 'light' | 'dark' | 'auto';
export type TurnstileSize = 'normal' | 'flexible' | 'compact';
export type TurnstileAppearance = 'always' | 'execute' | 'interaction-only';

export type TurnstileRenderOptions = {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: (code?: string) => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  appearance?: TurnstileAppearance;
  action?: string;
  cData?: string;
  retry?: 'auto' | 'never';
  'refresh-expired'?: 'auto' | 'manual' | 'never';
};

export type TurnstileWidgetId = string;

export type TurnstileGlobal = {
  render(
    container: HTMLElement | string,
    options: TurnstileRenderOptions,
  ): TurnstileWidgetId;
  reset(widgetId?: TurnstileWidgetId): void;
  remove(widgetId: TurnstileWidgetId): void;
  getResponse(widgetId?: TurnstileWidgetId): string | undefined;
};

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
    onloadTurnstileCallback?: () => void;
  }
}
