import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { WidgetGridComponent } from '../widget-grid/widget-grid.component';
import { WidgetLibraryPanelComponent } from '../widget-library-panel/widget-library-panel.component';
import type { WidgetDefinition } from '../widget-catalog/widget-catalog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [WidgetGridComponent, WidgetLibraryPanelComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly grid = viewChild.required(WidgetGridComponent);

  onInsert(def: WidgetDefinition): void {
    this.grid().addWidget(def);
  }
}
