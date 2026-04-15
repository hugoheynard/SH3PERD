import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { SH3_ICONS, type Sh3IconName } from './icon.registry';

/** Size presets map to a CSS font-size token; number is interpreted as pixels. */
export type Sh3IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/**
 * Shared icon component — the single surface for all SVG icons in the app.
 *
 * Icons are declared in {@link SH3_ICONS} and identified by a typed
 * {@link Sh3IconName} key. The raw SVG is injected once via `DomSanitizer`
 * and rendered through `[innerHTML]`. Tokens (colour, size) come from CSS
 * custom properties — the SVG inherits `currentColor` from the host.
 *
 * @selector `sh3-icon`
 *
 * @example
 * ```html
 * <sh3-icon name="search" />
 * <sh3-icon name="bin" size="lg" />
 * <sh3-icon name="heart" [size]="18" />
 * <sh3-icon name="edit" title="Edit track" />  <!-- a11y label -->
 * ```
 */
@Component({
  selector: 'sh3-icon',
  standalone: true,
  template: `<span
    class="icon-root"
    role="img"
    [attr.aria-label]="title() || null"
    [attr.aria-hidden]="title() ? null : 'true'"
    [style.--icon-size]="sizeVar()"
    [innerHTML]="svg()"></span>`,
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  /** Typed icon name from the central registry. */
  readonly name = input.required<Sh3IconName>();

  /** Size — token (`xs…xl`) or explicit pixel number. Defaults to `md`. */
  readonly size = input<Sh3IconSize>('md');

  /** Optional accessible label. If set, renders `aria-label`; otherwise `aria-hidden`. */
  readonly title = input<string>();

  private readonly sanitizer = inject(DomSanitizer);

  /** Sanitised SVG markup ready for `[innerHTML]`. */
  readonly svg = computed<SafeHtml>(() => {
    const raw = SH3_ICONS[this.name()] ?? '';
    if (!raw && this.name()) {
      console.warn(`[sh3-icon] unknown icon: "${this.name()}"`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  });

  /** Resolves the size input to a CSS length string for `--icon-size`. */
  readonly sizeVar = computed<string>(() => {
    const s = this.size();
    if (typeof s === 'number') return `${s}px`;
    switch (s) {
      case 'xs': return '12px';
      case 'sm': return '16px';
      case 'md': return '20px';
      case 'lg': return '24px';
      case 'xl': return '32px';
    }
  });
}
