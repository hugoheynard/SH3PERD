import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type ViewMode = 'cards' | 'table';

/**
 * Toggle button to switch between card and table views.
 *
 * Displays the opposite mode's icon + label (i.e. when in cards mode,
 * shows the table icon so clicking switches to table, and vice versa).
 *
 * @selector `sh3-view-toggle`
 *
 * @example
 * ```html
 * <sh3-view-toggle [mode]="viewMode()" (modeChange)="viewMode.set($event)" />
 * ```
 */
@Component({
  selector: 'sh3-view-toggle',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './view-toggle.component.html',
  styleUrl: './view-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewToggleComponent {
  /** Current active view mode. */
  readonly mode = input.required<ViewMode>();

  /** Emits the new mode when toggled. */
  readonly modeChange = output<ViewMode>();

  toggle(): void {
    this.modeChange.emit(this.mode() === 'cards' ? 'table' : 'cards');
  }
}
