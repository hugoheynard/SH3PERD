import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface PillOption {
  key: string;
  label: string;
}

/**
 * `<sh3-pill-selector>` — Horizontal row of selectable pills.
 *
 * Single-select by default. Each pill is a button that emits on click.
 *
 * ## Inputs
 *
 * | Input       | Type                  | Default | Description                         |
 * |-------------|-----------------------|---------|-------------------------------------|
 * | `options`   | `PillOption[]` (req.) | —       | Available options.                  |
 * | `activeKey` | `string` (required)   | —       | Currently selected key.             |
 *
 * ## Output
 *
 * | Output      | Type     | Description                          |
 * |-------------|----------|--------------------------------------|
 * | `selected`  | `string` | Emits the `key` of the clicked pill. |
 *
 * ## Examples
 *
 * ```html
 * <!-- Role selector -->
 * <sh3-pill-selector
 *   [options]="[{ key: 'manager', label: 'Manager' }, { key: 'member', label: 'Member' }]"
 *   [activeKey]="selectedRole()"
 *   (selected)="selectedRole.set($event)"
 * />
 *
 * <!-- Mode toggle -->
 * <sh3-pill-selector
 *   [options]="[{ key: 'contract', label: 'From contracts' }, { key: 'guest', label: 'Guest' }]"
 *   [activeKey]="mode()"
 *   (selected)="mode.set($event)"
 * />
 * ```
 */
@Component({
  selector: 'sh3-pill-selector',
  standalone: true,
  templateUrl: './pill-selector.component.html',
  styleUrl: './pill-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillSelectorComponent {
  readonly options = input.required<PillOption[]>();
  readonly activeKey = input.required<string>();
  readonly selected = output<string>();
}
