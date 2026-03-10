import { Component, input } from '@angular/core';
import { DragIconComponent } from '../../drag-icon/drag-icon.component';


/**
 * A card frame component that can be used to wrap any content in a card-like UI.
 * Best use for horizontal layout
 */
@Component({
  selector: 'ui-card-frame',
  imports: [
    DragIconComponent,
    DragIconComponent,
  ],
  templateUrl: './card-frame.component.html',
  styleUrl: './card-frame.component.scss'
})
export class CardFrameComponent {
  /**
   * Whether to show the drag icon in the top right corner of the card.
   * This is used to indicate that the card can be dragged and dropped to reorder it.
   * The drag icon is only shown when the card is draggable, which is determined by the parent component.
   */
  dragIcon = input<boolean>(false);
}
