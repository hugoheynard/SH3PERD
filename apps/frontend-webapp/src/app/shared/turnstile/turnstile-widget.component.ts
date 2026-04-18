import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { loadTurnstile } from './turnstile-loader';
import type { TurnstileTheme, TurnstileWidgetId } from './turnstile.types';

/**
 * Cloudflare Turnstile widget wrapper.
 *
 * Renders the managed challenge in an empty `<div>` and emits the token
 * up through `verified`. Most legitimate users never see the challenge —
 * Cloudflare decides invisibility vs. interaction based on its own bot
 * scoring.
 *
 * Token lifecycle:
 * - `verified` fires once the challenge is solved; parent should capture
 *   the token and include it in the next auth request body as
 *   `turnstileToken`.
 * - Tokens are single-use and expire (~5 min). On `expired` or after a
 *   failed submit, the parent calls `reset()` to request a fresh token.
 */
@Component({
  selector: 'sh3-turnstile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #host class="turnstile-host" aria-live="polite"></div>`,
  styles: [
    `
      :host {
        display: block;
        min-height: 65px;
      }
      .turnstile-host {
        display: flex;
        justify-content: center;
      }
    `,
  ],
})
export class TurnstileWidgetComponent {
  readonly siteKey = input.required<string>();
  readonly theme = input<TurnstileTheme>('auto');

  readonly verified = output<string>();
  readonly expired = output<void>();
  readonly errored = output<string | undefined>();

  private readonly host =
    viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly widgetId = signal<TurnstileWidgetId | null>(null);

  constructor() {
    // Render once the view's #host reference and the required siteKey
    // are both resolved. The effect re-runs if either changes, so
    // swapping siteKey / theme at runtime is supported.
    effect((onCleanup) => {
      const host = this.host().nativeElement;
      const siteKey = this.siteKey();
      const theme = this.theme();

      let cancelled = false;
      let renderedId: TurnstileWidgetId | null = null;

      loadTurnstile()
        .then((turnstile) => {
          if (cancelled) return;
          renderedId = turnstile.render(host, {
            sitekey: siteKey,
            theme,
            appearance: 'always',
            retry: 'auto',
            'refresh-expired': 'auto',
            callback: (token) => this.verified.emit(token),
            'expired-callback': () => this.expired.emit(),
            'error-callback': (code) => this.errored.emit(code),
          });
          this.widgetId.set(renderedId);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          // Loader failure (script blocked, offline, etc.). The backend
          // will then see a missing token and either bypass (dev) or
          // reject with CAPTCHA_REQUIRED — the parent toast surfaces it.
          console.warn('[Turnstile] Failed to load widget:', err);
          this.errored.emit('loader-failed');
        });

      onCleanup(() => {
        cancelled = true;
        const id = renderedId ?? this.widgetId();
        if (id && typeof window !== 'undefined' && window.turnstile) {
          try {
            window.turnstile.remove(id);
          } catch {
            /* widget already gone */
          }
        }
        this.widgetId.set(null);
      });
    });
  }

  /** Ask Turnstile for a fresh token after a failed submit. */
  reset(): void {
    const id = this.widgetId();
    if (id && typeof window !== 'undefined' && window.turnstile) {
      window.turnstile.reset(id);
    }
  }
}
