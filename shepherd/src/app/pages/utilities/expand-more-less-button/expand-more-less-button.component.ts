import {Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";

@Component({
  selector: 'expand-more-less-button',
  standalone: true,
    imports: [
        MatIcon,
        MatIconButton,
        NgIf
    ],
  templateUrl: './expand-more-less-button.component.html',
  styleUrl: './expand-more-less-button.component.scss',
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
