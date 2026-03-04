import { Component, Inject} from '@angular/core';
import { PANEL_DATA } from '../../../core/main-layout/main-layout.component';
import type { Artist, PerformanceTemplate } from '../program-state.service';

export interface ProgramSidePanelConfig {
  templates: PerformanceTemplate[];
  artists: Artist[];
  onTemplateDragStart: (template: PerformanceTemplate) => void;
  onArtistDragStart: (artist: Artist) => void;
}

@Component({
  selector: 'app-program-side-panel',
  imports: [],
  templateUrl: './program-side-panel.component.html',
  styleUrl: './program-side-panel.component.scss'
})
export class ProgramSidePanelComponent {

  constructor(
    @Inject(PANEL_DATA) public config: ProgramSidePanelConfig
  ) {}
}



