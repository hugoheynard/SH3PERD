import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  ExpandMoreLessButtonComponent
} from '../../../utilities/expand-more-less-button/expand-more-less-button.component';

@Component({
    selector: 'plv-section-header',
    imports: [
        ExpandMoreLessButtonComponent
    ],
    templateUrl: './plv-section-header.component.html',
    standalone: true,
    styleUrl: './plv-section-header.component.scss'
})
export class PlvSectionHeaderComponent {
  @Input() sectionTitle: string = '';
  @Output() openSection: EventEmitter<boolean> = new EventEmitter<boolean>();

  public isExpanded: boolean = false;

  onExpandToggle(expanded: boolean): void {
    this.isExpanded = expanded;
    this.openSection.emit(expanded);
  };
}
