import { Component, inject } from '@angular/core';
import { HelpRegistryService } from './help-registry.service';
import { LayoutService } from '../../core/services/layout.service';

/**
 * Right panel displaying contextual help entries
 * collected by `[sh3Info]` directives on the current page.
 *
 * Opened via: `layoutService.setRightPanel(HelpPanelComponent)`
 */
@Component({
  selector: 'app-help-panel',
  standalone: true,
  template: `
    <div class="help-panel">
      <div class="help-header">
        <h3 class="help-title">Help</h3>
        <button class="help-close" type="button" aria-label="Close help" (click)="close()">×</button>
      </div>

      <div class="help-body">
        @for (entry of helpRegistry.entries(); track entry.id) {
          <div class="help-entry">
            <span class="entry-label">{{ entry.label }}</span>
            <p class="entry-desc">{{ entry.description }}</p>
          </div>
        } @empty {
          <p class="help-empty">No help entries on this page.</p>
        }
      </div>
    </div>
  `,
  styleUrl: './help-panel.component.scss',
})
export class HelpPanelComponent {
  readonly helpRegistry = inject(HelpRegistryService);
  private readonly layout = inject(LayoutService);

  close(): void {
    this.layout.clearRightPanel();
  }
}
