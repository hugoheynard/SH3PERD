import { inject, Injectable } from '@angular/core';
import { SlotTemplateCardComponent } from '../slot-template-card/slot-template-card.component';
import { DragPreviewRegistryService } from '../../../core/drag-and-drop/drag-preview-registry.service';
import { GroupCardComponent } from '../group-card/group-card.component';
import { ArtistChipComponent } from '../artist-chip/artist-chip.component';
import { SlotDragPreviewComponent } from '../slot-preview/slot-preview.component';

/**
 * Registers all elements for dnd + their mapping to the preview component.
 * This is required to be able to show a preview of the dragged element.
 */
@Injectable({ providedIn: 'root' })
export class PlannerDndInitService {

  private registry = inject(DragPreviewRegistryService);

  constructor() {
    this.createPlannerRegister();
  }

  createPlannerRegister() {
    this.registry.register('template', {
      component: SlotTemplateCardComponent,
      mapInputs: template => ({ template })
    });

    this.registry.register('slot', {
      component: SlotDragPreviewComponent,
      mapInputs: slot => ({ slot })
    })

    this.registry.register('group', {
      component: GroupCardComponent,
      mapInputs: group => ({ group })
    })

    this.registry.register('artist', {
      component: ArtistChipComponent,
      mapInputs: artist => ({ artist })
    });
  };


}
