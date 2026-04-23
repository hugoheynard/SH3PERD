import {
  ChangeDetectionStrategy,
  Component,
  computed,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/icon/icon.component';
import { SidePanelSectionComponent } from '../../../shared/ui-frames/side-panel-section/side-panel-section.component';
import {
  matchesWidgetQuery,
  WIDGET_CATALOG,
  WIDGET_SECTIONS,
  type WidgetDefinition,
  type WidgetSection,
} from '../widget-catalog/widget-catalog';

/**
 * Right-hand side panel — library of widgets that can be dropped onto
 * the home dashboard grid. A search bar narrows the catalog; sections
 * only render when at least one widget still matches.
 *
 * The panel is purely a picker — it has no state of its own beyond
 * the search query. The parent (`HomeComponent`) reacts to `insert`
 * by forwarding the chosen definition to the grid.
 */
@Component({
  selector: 'app-widget-library-panel',
  standalone: true,
  imports: [FormsModule, IconComponent, SidePanelSectionComponent],
  templateUrl: './widget-library-panel.component.html',
  styleUrl: './widget-library-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetLibraryPanelComponent {
  /** Emitted when the user picks a widget to add to the grid. */
  readonly insert = output<WidgetDefinition>();

  /** Live search query; bound to the input via `ngModel`. */
  readonly query = signal('');

  /** Sections in render order, tagged with the matching widgets. */
  readonly sections = computed(() => {
    const q = this.query();
    return WIDGET_SECTIONS.map((section) => ({
      id: section.id,
      label: section.label,
      widgets: WIDGET_CATALOG.filter(
        (w) => w.section === section.id && matchesWidgetQuery(w, q),
      ),
    })).filter((s) => s.widgets.length > 0);
  });

  /** Total widgets across all sections — displayed as a subtitle. */
  readonly totalMatches = computed(() =>
    this.sections().reduce((acc, s) => acc + s.widgets.length, 0),
  );

  clearQuery(): void {
    this.query.set('');
  }

  onInsert(widget: WidgetDefinition): void {
    this.insert.emit(widget);
  }

  /** Helper for `@for` track-by — narrows the section union to a string. */
  trackSection(_: number, section: { id: WidgetSection }): WidgetSection {
    return section.id;
  }
}
