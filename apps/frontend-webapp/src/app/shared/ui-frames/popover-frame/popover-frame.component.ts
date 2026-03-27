import { Component, inject } from '@angular/core';
import { LayoutService } from '../../../core/services/layout.service';

/**
 * Generic popover container used to display floating UI panels such as
 * forms, editors or contextual tools.
 *
 * This component provides the visual frame (header, body, footer)
 * and relies on Angular content projection to inject custom content.
 *
 * The popover is typically rendered through the LayoutService inside
 * the global popover layer of the MainLayout.
 *
 * ----------------------------------------
 * Content projection slots
 * ----------------------------------------
 *
 * [popover-title]
 *   Content projected into the popover header title area.
 *   Usually a short label describing the popover purpose.
 *
 * [popover-body]
 *   Main content area of the popover.
 *   Typically contains forms, configuration panels,
 *   editors or other interactive UI.
 *
 * [popover-footer]
 *   Footer action area.
 *   Typically used for primary / secondary actions
 *   such as Cancel / Save / Create buttons.
 *
 * ----------------------------------------
 * Example usage
 * ----------------------------------------
 *
 * <app-popover-frame>
 *
 *   <div popover-title>
 *     Create template
 *   </div>
 *
 *   <form popover-body>
 *     ...
 *   </form>
 *
 *   <div popover-footer>
 *     <ui-button variant="secondary">Cancel</ui-button>
 *     <ui-button>Create</ui-button>
 *   </div>
 *
 * </app-popover-frame>
 *
 * ----------------------------------------
 * Behavior
 * ----------------------------------------
 *
 * - Provides consistent styling for all popovers in the application
 * - Includes a built-in close button in the header
 * - Does not contain business logic
 * - Designed to be used as a layout frame only
 *
 */
@Component({
  selector: 'ui-popover-frame',
  imports: [],
  templateUrl: './popover-frame.component.html',
  styleUrl: './popover-frame.component.scss'
})
export class PopoverFrameComponent {
  private layout = inject(LayoutService);

  close(): void {
    this.layout.clearPopover();
  };
}
