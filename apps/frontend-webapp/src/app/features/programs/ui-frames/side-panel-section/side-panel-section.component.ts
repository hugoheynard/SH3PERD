import { Component, input } from '@angular/core';

@Component({
  selector: 'app-side-panel-section',
  imports: [],
  standalone: true,
  templateUrl: './side-panel-section.component.html',
  styleUrl: './side-panel-section.component.scss'
})
export class SidePanelSectionComponent {
  public title = input.required<string>();
  count = input<number | undefined>(undefined);

  public sectionCollapsed = false;

  toggleSection() {
    this.sectionCollapsed = !this.sectionCollapsed;
  }
}
