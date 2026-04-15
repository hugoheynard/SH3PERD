import {Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import { IconComponent } from '../../../shared/icon/icon.component';
import {MatIconButton} from "@angular/material/button";


@Component({
  selector: 'expand-more-less-button',
  imports: [
    IconComponent,
    MatIconButton,
],
  templateUrl: './expand-more-less-button.component.html',
  styleUrl: './expand-more-less-button.component.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
export class ExpandMoreLessButtonComponent {
  public expanded: boolean = false;
  @Output() open:EventEmitter<boolean> = new EventEmitter<boolean>();

  toggleExpand(): void {
    this.expanded = !this.expanded;
    this.open.emit(this.expanded);
  };
}
