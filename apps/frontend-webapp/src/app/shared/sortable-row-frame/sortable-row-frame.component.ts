import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonIconComponent } from '../button-icon/button-icon.component';

export type SortableRowTone = 'default' | 'accent' | 'warning' | 'muted';

@Component({
  selector: 'sh3-sortable-row-frame',
  standalone: true,
  imports: [IconComponent, ButtonIconComponent],
  templateUrl: './sortable-row-frame.component.html',
  styleUrl: './sortable-row-frame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableRowFrameComponent {
  readonly dragging = input(false);
  readonly sortable = input(true);
  readonly showRemove = input(false);
  readonly removeLabel = input('Remove');
  readonly tone = input<SortableRowTone>('default');

  readonly removed = output<void>();
}
