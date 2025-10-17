import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'data-list',
  imports: [
    NgTemplateOutlet,
  ],
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataListComponent<T extends object> {
  readonly data = input.required<T[]>();

  /**
   * List of keys of T to display as columns.
   * The order of the keys in the array determines the order of the columns.
   * If empty, all keys of T will be displayed.
   */
  readonly displayedKeys = input<(keyof T)[]>([]);
  readonly rowActionsTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);
}
