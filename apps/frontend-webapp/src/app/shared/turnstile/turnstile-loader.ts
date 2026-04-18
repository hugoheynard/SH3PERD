import type { TurnstileGlobal } from './turnstile.types';

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loaderPromise: Promise<TurnstileGlobal> | null = null;

/**
 * Lazily load the Cloudflare Turnstile API script — once per page.
 *
 * Safe to call from multiple widget instances; the second call resolves
 * to the same Promise. Resolves to `window.turnstile` once the script's
 * onload fires and the global is present.
 *
 * No-ops (and rejects) when invoked outside a browser (SSR).
 */
export function loadTurnstile(): Promise<TurnstileGlobal> {
  if (loaderPromise) {
    return loaderPromise;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(
      new Error('Turnstile is only available in the browser.'),
    );
  }

  if (window.turnstile) {
    loaderPromise = Promise.resolve(window.turnstile);
    return loaderPromise;
  }

  loaderPromise = new Promise<TurnstileGlobal>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${TURNSTILE_SCRIPT_SRC.split('?')[0]}"]`,
    );

    const onReady = (): void => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        reject(
          new Error(
            'Turnstile script loaded but window.turnstile is undefined.',
          ),
        );
      }
    };

    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Turnstile script.')),
        { once: true },
      );
      if (window.turnstile) onReady();
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onReady, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Turnstile script.')),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return loaderPromise;
}
