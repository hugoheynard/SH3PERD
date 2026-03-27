import { Component, computed, inject, Inject, type WritableSignal } from '@angular/core';
import { INJECTION_DATA } from '../../../../core/main-layout/main-layout.component';
import { SlotTemplateCardComponent } from '../../draggable-components/slot-template-card/slot-template-card.component';
import { ArtistCardComponent } from '../../draggable-components/artist-card/artist-card.component';
import { type ArtistWorkload, WorkloadService } from '../../services/workload.service';
import { SidePanelSectionComponent } from '../../../../shared/ui-frames/side-panel-section/side-panel-section.component';
import { LayoutService } from '../../../../core/services/layout.service';
import { EditTemplatePopoverComponent } from '../../popovers/edit-template-popover/edit-template-popover.component';
import { ButtonComponent } from '../../button/button.component';
import type { PlannerArtist, UserGroup, ArtistPerformanceSlotTemplate } from '../../program-types';
import { GroupCardComponent } from '../../group-card/group-card.component';
import { ArtistWorkloadStripComponent } from '../../artist-workload-strip/artist-workload-strip.component';
import { DndDragDirective } from '../../../../core/drag-and-drop/dndDrag.directive';


export interface ProgramSidePanelConfig {
  templates: ArtistPerformanceSlotTemplate[];
  staff: WritableSignal<PlannerArtist[]>;
  groups: WritableSignal<UserGroup[]>;
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
    ArtistWorkloadStripComponent,
    DndDragDirective,
  ],
  templateUrl: './program-side-panel.component.html',
  styleUrl: './program-side-panel.component.scss'
})
export class ProgramSidePanelComponent {

  private workload = inject(WorkloadService);
  private layout = inject(LayoutService);

  constructor(
    @Inject(INJECTION_DATA) public config: ProgramSidePanelConfig
  ) {};

  /**
   * Computes the list of artists along with their workload information, by mapping over the staff and retrieving the corresponding workload from the workload service.
   */
  artistsWithWorkload = computed(() => {

    const workloads = this.workload.artistWorkloadMap();

    return this.config.staff().map(artist => ({
      artist,
      workload: workloads.get(artist.id) ?? emptyWorkload()
    }));
  });


  onEditTemplate(template: ArtistPerformanceSlotTemplate) {
    this.layout.setPopover(EditTemplatePopoverComponent, {
      mode: 'edit',
      template
    });
  };


  //------------------------ POPOVER ACTIONS ------------------
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



