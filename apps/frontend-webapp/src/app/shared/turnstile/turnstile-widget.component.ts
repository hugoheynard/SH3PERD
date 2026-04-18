import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadTurnstile } from './turnstile-loader';
import type {
  TurnstileAppearance,
  TurnstileSize,
  TurnstileTheme,
  TurnstileWidgetId,
} from './turnstile.types';

/**
 * Cloudflare Turnstile widget wrapper.
 *
 * Default posture is `interaction-only`: the widget is invisible for
 * non-suspicious traffic (the vast majority of legitimate users), and
 * only renders an interactive challenge when Cloudflare's heuristics
 * flag the session. This matches the prod UX we want — the auth form
 * stays clean and only surfaces a challenge when it's actually useful.
 *
 * The Cloudflare challenge is rendered inside an iframe whose internals
 * we cannot theme; this component only controls the outer container
 * (centering, spacing, optional label) and the pass-through options
 * Cloudflare exposes: `theme`, `size`, `appearance`.
 *
 * Token lifecycle:
 * - `verified` fires once the challenge is solved (visibly or silently);
 *   parent should capture the token and include it in the next auth
 *   request body as `turnstileToken`.
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
  readonly size = input<TurnstileSize>('flexible');
  readonly appearance = input<TurnstileAppearance>('interaction-only');

  readonly verified = output<string>();
  readonly expired = output<void>();
  readonly errored = output<string | undefined>();

  private readonly host =
    viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly widgetId = signal<TurnstileWidgetId | null>(null);
  private readonly ngZone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    // Render once the view's #host reference and the required siteKey
    // are both resolved. The effect re-runs if either changes, so
    // swapping siteKey / theme / size / appearance at runtime is
    // supported.
    //
    // The Turnstile iframe runs its own timers / polls internally —
    // leaving them inside NgZone keeps the app perpetually "unstable"
    // (`Application did not stabilize within N seconds`) and breaks
    // SSR / `whenStable`. We load the script and render the widget
    // outside NgZone, then hop back in only to emit component outputs
    // so the parent form's change detection still fires.
    //
    // SSR: Turnstile needs `window` + `document`, so bail entirely on
    // the server. The browser render will kick in during hydration.
    effect((onCleanup) => {
      if (!this.isBrowser) return;

      const host = this.host().nativeElement;
      const siteKey = this.siteKey();
      const theme = this.theme();
      const size = this.size();
      const appearance = this.appearance();

      let cancelled = false;
      let renderedId: TurnstileWidgetId | null = null;

      this.ngZone.runOutsideAngular(() => {
        loadTurnstile()
          .then((turnstile) => {
            if (cancelled) return;
            renderedId = turnstile.render(host, {
              sitekey: siteKey,
              theme,
              size,
              appearance,
              retry: 'auto',
              'refresh-expired': 'auto',
              callback: (token) =>
                this.ngZone.run(() => this.verified.emit(token)),
              'expired-callback': () =>
                this.ngZone.run(() => this.expired.emit()),
              'error-callback': (code) =>
                this.ngZone.run(() => this.errored.emit(code)),
            });
            this.widgetId.set(renderedId);
          })
          .catch((err: unknown) => {
            if (cancelled) return;
            // Loader failure (script blocked, offline, etc.). The backend
            // will then see a missing token and either bypass (dev) or
            // reject with CAPTCHA_REQUIRED — the parent toast surfaces it.
            console.warn('[Turnstile] Failed to load widget:', err);
            this.ngZone.run(() => this.errored.emit('loader-failed'));
          });
      });

      onCleanup(() => {
        cancelled = true;
        const id = renderedId ?? this.widgetId();
        if (id && typeof window !== 'undefined' && window.turnstile) {
          this.ngZone.runOutsideAngular(() => {
            try {
              window.turnstile!.remove(id);
            } catch {
              /* widget already gone */
            }
          });
        }
        this.widgetId.set(null);
      });
    });
  }

  /** Ask Turnstile for a fresh token after a failed submit. */
  reset(): void {
    const id = this.widgetId();
    if (id && typeof window !== 'undefined' && window.turnstile) {
      this.ngZone.runOutsideAngular(() => {
        window.turnstile!.reset(id);
      });
    }
  }
}
