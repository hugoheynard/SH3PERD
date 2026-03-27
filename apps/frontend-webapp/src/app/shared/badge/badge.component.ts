import { Component, input } from '@angular/core';

/**
 * Shared badge / tag component for labels, statuses, and categories.
 *
 * @selector `sh3-badge`
 *
 * @example
 * ```html
 * <!-- Default accent pill -->
 * <sh3-badge content="In repertoire" />
 *
 * <!-- Square info tag (purple) -->
 * <sh3-badge content="Jazz" radius="square" variant="info" />
 *
 * <!-- Warning pill -->
 * <sh3-badge content="Pending" variant="warning" />
 * ```
 */
@Component({
  selector: 'sh3-badge',
  standalone: true,
  template: `{{ content() }}`,
  styleUrl: './badge.component.scss',
  host: {
    '[class]': 'variant() + " " + radius()',
  },
})
export class BadgeComponent {

  /** Text displayed inside the badge. */
  readonly content = input.required<string>();

  /**
   * Border-radius preset.
   * - `pill` — fully rounded (default, like repertoire badge)
   * - `square` — small radius (like genre tags)
   */
  readonly radius = input<'pill' | 'square'>('pill');

  /**
   * Semantic color variant, mapped to design tokens.
   * - `accent` (default) — teal, general purpose
   * - `info` — purple, informative / categorical
   * - `warning` — amber, attention needed
   * - `alert` — red, critical / error
   * @default 'accent'
   */
  readonly variant = input<'accent' | 'info' | 'warning' | 'alert'>('accent');
}
