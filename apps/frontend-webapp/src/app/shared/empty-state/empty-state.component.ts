import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * `<sh3-empty-state>` — Centered empty state with icon, title, subtitle and action slot.
 *
 * The icon is an SVG path `d` string (same format as `sh3-tab-nav` icons).
 * The action slot uses content projection for a button or any element.
 *
 * @example
 * ```html
 * <sh3-empty-state
 *   title="No company yet"
 *   subtitle="Create your company space to manage artists, teams and contracts."
 *   icon="M19,3H5C3.346,3,2,4.346,2,6v16h20V6..."
 * >
 *   <sh3-button variant="primary" (clicked)="create()">+ Create</sh3-button>
 * </sh3-empty-state>
 * ```
 */
@Component({
  selector: 'sh3-empty-state',
  standalone: true,
  template: `
    <div class="empty">
      @if (icon()) {
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path [attr.d]="icon()" />
          </svg>
        </div>
      }
      <p class="empty-title">{{ title() }}</p>
      @if (subtitle()) {
        <p class="empty-sub">{{ subtitle() }}</p>
      }
      <div class="empty-action">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; align-items: center; justify-content: center; flex: 1; }
    .empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 24px; }
    .empty-icon { color: rgba(255, 255, 255, 0.12); margin-bottom: 4px; }
    .empty-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin: 0; }
    .empty-sub { font-size: var(--text-xs); color: var(--text-muted); margin: 0; text-align: center; max-width: 320px; line-height: 1.6; }
    .empty-action { margin-top: 4px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input('');
}
