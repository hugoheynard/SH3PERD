import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `<sh3-status-badge>` — Colored badge indicating a status.
 *
 * ## Inputs
 *
 * | Input    | Type               | Default | Description                     |
 * |----------|--------------------|---------|---------------------------------|
 * | `status` | `string` (required)| —       | Status key (determines color).  |
 * | `label`  | `string`           | status  | Display text (defaults to status value). |
 *
 * ## Supported statuses
 *
 * - `'active'` / `'connected'` — green accent
 * - `'pending'` — yellow warning
 * - `'suspended'` / `'error'` — red alert
 * - `'coming-soon'` / `'not_connected'` — grey muted
 * - Any other value — neutral grey
 *
 * ## Examples
 *
 * ```html
 * <sh3-status-badge status="active" />
 * <sh3-status-badge status="pending" label="En attente" />
 * <sh3-status-badge status="coming-soon" label="Coming soon" />
 * ```
 */
@Component({
  selector: 'sh3-status-badge',
  standalone: true,
  template: `<span class="badge" [attr.data-status]="normalizedStatus()">{{ label() || status() }}</span>`,
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly label = input<string>('');

  readonly normalizedStatus = () => {
    const s = this.status();
    if (s === 'connected') return 'active';
    if (s === 'error') return 'suspended';
    if (s === 'not_connected') return 'coming-soon';
    return s;
  };
}
