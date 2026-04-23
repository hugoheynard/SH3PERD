import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { TTodayDateWidgetConfig } from '@sh3pherd/shared-types';

/**
 * Home dashboard date widget — shows today's date in three tiers:
 * weekday label, big day number, month + year.
 *
 * The component keeps a `now` signal refreshed once a minute so the
 * card flips at midnight without a reload. The interval only runs in
 * the browser (SSR skips it) and is cleared on destroy via
 * {@link DestroyRef}.
 *
 * Locale is sourced from the typed widget config; an unset locale
 * falls back to the user's browser default via `toLocaleString()`.
 */
@Component({
  selector: 'today-date-widget',
  standalone: true,
  imports: [],
  templateUrl: './today-date-widget.component.html',
  styleUrl: './today-date-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayDateWidgetComponent {
  /** Optional per-widget config — today only carries an optional locale. */
  readonly config = input<TTodayDateWidgetConfig | undefined>(undefined);

  /**
   * Back-compat alias: the first iteration of the widget exposed a
   * bare `locale` input. The grid still forwards that name for
   * persisted instances created before the typed-config migration.
   */
  readonly locale = input<string | undefined>(undefined);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly now = signal<Date>(new Date());

  /** Resolved locale — explicit config wins over legacy input. */
  readonly resolvedLocale = computed<string | undefined>(
    () => this.config()?.locale ?? this.locale(),
  );

  readonly weekday = computed(() =>
    this.now().toLocaleDateString(this.resolvedLocale(), { weekday: 'short' }),
  );

  readonly day = computed(() =>
    this.now().getDate().toString().padStart(2, '0'),
  );

  readonly monthYear = computed(() =>
    this.now().toLocaleDateString(this.resolvedLocale(), {
      month: 'short',
      year: 'numeric',
    }),
  );

  constructor() {
    if (!this.isBrowser) return;

    // Tick once a minute — cheap and enough to flip at midnight. A
    // tighter cadence only helps if we ever render seconds, which we
    // don't. Cleared automatically when the widget is destroyed.
    const handle = setInterval(() => this.now.set(new Date()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(handle));
  }
}
