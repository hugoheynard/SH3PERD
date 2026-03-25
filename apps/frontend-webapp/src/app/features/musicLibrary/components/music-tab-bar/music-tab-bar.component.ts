import { Component, input, output } from '@angular/core';
import type { MusicTab } from '../../music-library-types';

@Component({
  selector: 'app-music-tab-bar',
  standalone: true,
  imports: [],
  template: `
    <div class="tab-bar">
      <div class="tabs-scroll">
        @for (tab of tabs(); track tab.id) {
          <button
            class="tab"
            [class.active]="tab.id === activeTabId()"
            (click)="tabSelect.emit(tab.id)"
            type="button"
          >
            <span class="tab-title">{{ tab.title }}</span>
            @if (tabs().length > 1) {
              <span
                class="tab-close"
                (click)="onClose($event, tab.id)"
                role="button"
                aria-label="Close tab"
              >×</span>
            }
          </button>
        }
      </div>

      <button class="tab-add" (click)="tabAdd.emit()" type="button" aria-label="Add tab">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  `,
  styleUrl: './music-tab-bar.component.scss',
})
export class MusicTabBarComponent {

  readonly tabs = input.required<MusicTab[]>();
  readonly activeTabId = input.required<string>();

  readonly tabSelect = output<string>();
  readonly tabAdd = output<void>();
  readonly tabClose = output<string>();

  onClose(event: MouseEvent, tabId: string): void {
    event.stopPropagation();
    this.tabClose.emit(tabId);
  }
}
