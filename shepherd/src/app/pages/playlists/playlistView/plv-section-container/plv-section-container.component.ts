import {Component, Input} from '@angular/core';

@Component({
  selector: 'plv-section-container',
  standalone: true,
  imports: [],
  templateUrl: './plv-section-container.component.html',
  styleUrl: './plv-section-container.component.scss'
})
export class PlvSectionContainerComponent {
  public isExpanded: boolean = false;

  onHeaderToggle(expanded: boolean): void {
    this.isExpanded = expanded;
  }
}
