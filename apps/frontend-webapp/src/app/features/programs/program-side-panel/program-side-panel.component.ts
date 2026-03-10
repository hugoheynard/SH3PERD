import { Component, computed, inject, Inject } from '@angular/core';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { SlotTemplateCardComponent } from '../slot-template-card/slot-template-card.component';
import { ArtistCardComponent } from '../artist-card/artist-card.component';
import { type ArtistWorkload, WorkloadService } from '../services/workload.service';
import { SidePanelSectionComponent } from '../side-panel-section/side-panel-section.component';
import { LayoutService } from '../../../core/services/layout.service';
import { EditTemplatePopoverComponent } from '../edit-template-popover/edit-template-popover.component';
import { ButtonComponent } from '../button/button.component';
import type { Artist, ArtistGroup, ArtistPerformanceSlotTemplate } from '../program-types';
import { GroupCardComponent } from '../group-card/group-card.component';


export interface ProgramSidePanelConfig {
  templates: ArtistPerformanceSlotTemplate[];
  artists: Artist[];
  groups: ArtistGroup[];
  onTemplateDragStart: (template: ArtistPerformanceSlotTemplate) => void;
  onArtistDragStart: (artist: Artist) => void;
  onGroupDragStart: (group: ArtistGroup) => void;
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
    SidePanelSectionComponent,
    ButtonComponent,
    GroupCardComponent,
  ],
  templateUrl: './program-side-panel.component.html',
  styleUrl: './program-side-panel.component.scss'
})
export class ProgramSidePanelComponent {

  constructor(
    @Inject(INJECTION_DATA) public config: ProgramSidePanelConfig
  ) {}

  private workload = inject(WorkloadService);
  private layout = inject(LayoutService);

  get groups() {
    return this.config.groups;
  }

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

  onTemplateDrag(template: ArtistPerformanceSlotTemplate) {
    this.config.onTemplateDragStart(template);
  };

  onArtistDragStart(artist: Artist) {
    this.config.onArtistDragStart(artist);
  };

  onEditTemplate(template: ArtistPerformanceSlotTemplate) {
    this.layout.setPopover(EditTemplatePopoverComponent, {
      mode: 'edit',
      template
    });
  };


  protected readonly emptyWorkload = emptyWorkload;

  /**
   * Opens the popover to create a new performance template.
   */
  createTemplatePopover( ): void {
    this.layout.setPopover(EditTemplatePopoverComponent, { mode: 'create' });
  };

  createUserGroup(): void {
    `TODO: Implement create user group functionality`
  };
}



