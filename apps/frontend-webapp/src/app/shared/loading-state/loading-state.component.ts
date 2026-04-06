import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `<sh3-loading>` — Centered loading indicator.
 *
 * @input message — Text to display. Defaults to "Loading...".
 *
 * @example
 * ```html
 * <sh3-loading />
 * <sh3-loading message="Loading company..." />
 * ```
 */
@Component({
  selector: 'sh3-loading',
  standalone: true,
  template: `<div class="loading"><span>{{ message() }}</span></div>`,
  styles: [`
    :host { display: flex; align-items: center; justify-content: center; flex: 1; }
    .loading { color: var(--text-muted); font-size: var(--text-sm); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {
  readonly message = input('Loading...');
}
