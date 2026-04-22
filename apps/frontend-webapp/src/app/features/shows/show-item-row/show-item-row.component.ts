import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { TShowSectionItemView } from '@sh3pherd/shared-types';
import type { ShowSectionItemDragPayload } from '../../../core/drag-and-drop/drag.types';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { SortableRowFrameComponent } from '../../../shared/sortable-row-frame/sortable-row-frame.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import {
  showItemDurationLabel,
  showItemSubtitle,
  showItemTitle,
} from './show-item-row.utils';

@Component({
  selector: 'app-show-item-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DndDragDirective, SortableRowFrameComponent, IconComponent],
  templateUrl: './show-item-row.component.html',
  styleUrl: './show-item-row.component.scss',
  host: {
    '[attr.data-kind]': 'item().kind',
  },
})
export class ShowItemRowComponent {
  readonly item = input.required<TShowSectionItemView>();
  readonly dragData = input.required<ShowSectionItemDragPayload>();
  readonly dragging = input(false);

  readonly removed = output<void>();

  protected readonly tone = computed(() =>
    this.item().kind === 'playlist' ? 'accent' : 'default',
  );

  protected readonly iconName = computed(() =>
    this.item().kind === 'playlist' ? 'play' : 'music-note',
  );

  protected readonly title = computed(() => showItemTitle(this.item()));
  protected readonly subtitle = computed(() => showItemSubtitle(this.item()));
  protected readonly duration = computed(() =>
    showItemDurationLabel(this.item()),
  );
  protected readonly durationAriaLabel = computed(() =>
    this.item().kind === 'version'
      ? 'Track duration'
      : 'Playlist total duration',
  );
}
