import { Component, computed, inject, Inject } from '@angular/core';
import { PANEL_DATA } from '../../../core/main-layout/main-layout.component';
import type { Artist, PerformanceTemplate } from '../services/program-state.service';
import { SlotTemplateCardComponent } from '../slot-template-card/slot-template-card.component';
import { ArtistCardComponent } from '../artist-card/artist-card.component';
import { type ArtistWorkload, WorkloadService } from '../services/workload.service';
import { JsonPipe } from '@angular/common';

export interface ProgramSidePanelConfig {
  templates: PerformanceTemplate[];
  artists: Artist[];
  onTemplateDragStart: (template: PerformanceTemplate) => void;
  onArtistDragStart: (artist: Artist) => void;
}

export function emptyWorkload(): ArtistWorkload {
  return {
    segments: [],
    totalMinutes: 0,
    score: 0,
    firstStart: 0,
    lastEnd: 0
  };
}

@Component({
  selector: 'app-program-side-panel',
  imports: [
    SlotTemplateCardComponent,
    ArtistCardComponent,
    JsonPipe,
  ],
  templateUrl: './program-side-panel.component.html',
  styleUrl: './program-side-panel.component.scss'
})
export class ProgramSidePanelComponent {

  constructor(
    @Inject(PANEL_DATA) public config: ProgramSidePanelConfig
  ) {}

  private workload = inject(WorkloadService);
  artistWorkloads = this.workload.artistWorkloadMap;

  artistsWithWorkload = computed(() => {

    const workloads = this.artistWorkloads();

    return this.config.artists.map(artist => ({
      artist,
      workload: workloads.get(artist.id) ?? emptyWorkload()
    }));

  });

  openCreateTemplate() {

  }

  onTemplateDrag(template: PerformanceTemplate) {
    this.config.onTemplateDragStart(template);
  }

  templatesCollapsed = false;
  artistsCollapsed = false;

  toggleTemplates() {
    this.templatesCollapsed = !this.templatesCollapsed;
  }

  toggleArtists() {
    this.artistsCollapsed = !this.artistsCollapsed;
  }

  protected readonly emptyWorkload = emptyWorkload;
}



