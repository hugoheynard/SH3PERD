import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { IconComponent, type Sh3IconSize } from '../icon/icon.component';
import type { Sh3IconName } from '../icon/icon.registry';

export type Sh3ButtonIconShape = 'square' | 'round';
export type Sh3ButtonIconSize = 'xs' | 'sm' | 'md' | 'lg';
export type Sh3ButtonIconTone = 'ghost' | 'accent' | 'critical';

/**
 * Shared icon-only button — the design system primitive for any clickable
 * affordance whose label is the icon itself (toolbars, transport bars,
 * inline row actions, dropdown carets, …).
 *
 * For buttons with text, use `sh3-button` instead.
 *
 * @selector `sh3-button-icon`
 *
 * @example
 * ```html
 * <!-- Default: ghost square 32px -->
 * <sh3-button-icon icon="edit" tooltip="Edit" (clicked)="edit()" />
 *
 * <!-- Toolbar (small, square, ghost): orgchart, music library, etc. -->
 * <sh3-button-icon icon="reload" size="xs" tooltip="Reset zoom" (clicked)="resetZoom()" />
 *
 * <!-- Audio transport (round, accent, large): play/pause primary -->
 * <sh3-button-icon icon="play" shape="round" tone="accent" size="lg" (clicked)="play()" />
 *
 * <!-- Toggle (uses two-way active state) -->
 * <sh3-button-icon icon="eye" tooltip="Toggle mask" [(active)]="masked" />
 *
 * <!-- Destructive -->
 * <sh3-button-icon icon="bin" tone="critical" tooltip="Delete" (clicked)="delete()" />
 * ```
 */
@Component({
  selector: 'sh3-button-icon',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-shape]': 'shape()',
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
    '[attr.data-active]': 'active() ? "" : null',
  },
})
export class ButtonIconComponent {
  /** Icon to render (typed against the registry). */
  readonly icon = input.required<Sh3IconName>();

  /**
   * Visual shape of the surface.
   * - `square` — rounded-corner square (default — toolbars, row actions)
   * - `round` — circular (transport bars, big primary actions)
   * @default 'square'
   */
  readonly shape = input<Sh3ButtonIconShape>('square');

  /**
   * Hit-area preset.
   * - `xs` — 22px (toolbar buttons inline with text)
   * - `sm` — 28px (compact actions)
   * - `md` — 32px (default)
   * - `lg` — 38px (primary transport / call-to-action)
   * @default 'md'
   */
  readonly size = input<Sh3ButtonIconSize>('md');

  /**
   * Visual tone — controls colour + background.
   * - `ghost` — transparent, accent on hover (default)
   * - `accent` — accent-filled background, white icon
   * - `critical` — alert-tinted (destructive actions)
   * @default 'ghost'
   */
  readonly tone = input<Sh3ButtonIconTone>('ghost');

  /** Two-way bindable toggle state (renders pressed/filled when true). */
  readonly active = model<boolean>(false);

  /** Disables the button (greys out, blocks pointer). */
  readonly disabled = input<boolean>(false);

  /** Tooltip text — sets both `title` and `aria-label`. Strongly recommended. */
  readonly tooltip = input<string>();

  /**
   * Native `type` attribute of the inner `<button>`.
   * Renamed from `type` (which collided with the `tone` semantic).
   * @default 'button'
   */
  readonly buttonType = input<'button' | 'submit'>('button');

  /** Emitted on click (passes the native MouseEvent). */
  readonly clicked = output<MouseEvent>();

  /** Resolves the icon size from the button size preset. */
  readonly iconSize = computed<Sh3IconSize>(() => {
    switch (this.size()) {
      case 'xs': return 'xs'; // 12px
      case 'sm': return 'sm'; // 16px
      case 'md': return 'sm'; // 16px in 32 hit-area
      case 'lg': return 'md'; // 20px in 38 hit-area
    }
  });

  onClick(e: MouseEvent): void {
    if (this.disabled()) return;
    this.active.update(v => !v);
    this.clicked.emit(e);
  }
}
