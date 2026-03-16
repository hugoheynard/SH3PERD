import { Component, input } from '@angular/core';


@Component({
  selector: 'ui-insert-line',
  standalone: true,
  templateUrl: './insert-line.component.html',
  styleUrl: './insert-line.component.scss'
})
export class InsertLineComponent {

  /**
   * Vertical position (px) inside the drop container.
   */
  top = input.required<number>();
  roomId = input<string>();

}
