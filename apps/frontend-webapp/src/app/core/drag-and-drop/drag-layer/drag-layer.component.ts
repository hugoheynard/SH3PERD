import { Component, computed, inject } from '@angular/core';
import { DragSessionService } from '../drag-session.service';
import { NgComponentOutlet } from '@angular/common';
import { DragPreviewRegistryService } from '../drag-preview-registry.service';

/**
 * Global drag preview layer.
 *
 * This component renders the visual representation of the currently dragged
 * item using a dynamically resolved preview component.
 *
 * It listens to the active drag session from {@link DragSessionService} and
 * resolves the appropriate preview component through the
 * {@link DragPreviewRegistryService}.
 *
 * The preview component is rendered using `NgComponentOutlet` and receives
 * its inputs via the registry `mapInputs` function.
 *
 * This layer should be mounted **once at the root of the application UI**
 * so that drag previews can appear above all other components.
 *
 * Responsibilities:
 *
 * - Observe the current drag session
 * - Resolve the preview component for the dragged item type
 * - Map drag payload data to preview component inputs
 * - Render the preview at the cursor position
 *
 * Architecture flow:
 *
 * ```
 * DragSessionService
 *        │
 *        ▼
 * DragLayerComponent
 *        │
 *        ▼
 * DragPreviewRegistryService
 *        │
 *        ▼
 * Preview component (ArtistCard, SlotCard, etc.)
 * ```
 *
 * Design notes:
 *
 * - The drag layer is **UI-only** and does not handle drag logic.
 * - Preview components are registered centrally in the preview registry.
 * - The layer uses Angular signals for reactive updates during drag.
 *
 * Typical usage:
 *
 * ```
 * <ui-drag-layer />
 * ```
 *
 * This component should usually be placed near the root layout so the
 * preview is not clipped by parent containers.
 */
@Component({
  selector: 'ui-drag-layer',
  imports: [
    NgComponentOutlet,
  ],
  templateUrl: './drag-layer.component.html',
  styleUrl: './drag-layer.component.scss'
})
export class DragLayerComponent {

  drag = inject(DragSessionService);
  registry = inject(DragPreviewRegistryService);

  preview = computed(() => {

    const drag = this.drag.current();
    if (!drag) {
      return null;
    }

    if (drag.type === 'resize') {
      return null;
    }

    const def = this.registry.get(drag.type);
    if (!def) {
      return null;
    }

    return {
      component: def.component,
      inputs: def.mapInputs(drag.data)
    };
  });

  //TODO : IMPLEMENT DRAG CLONE METHOD
}
