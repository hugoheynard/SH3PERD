import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { LayoutService } from '../../../core/services/layout.service';
import { UpgradePanelComponent } from '../../../core/components/upgrade-panel/upgrade-panel.component';

/**
 * Popover shown when the user clicks the locked save/recall affordance.
 *
 * Explains that saving and recalling tab configurations isn't available on
 * the current plan, and hands off to the shared upgrade right panel via
 * `LayoutService.setRightPanel(UpgradePanelComponent)` on confirmation.
 */
@Component({
  selector: 'app-save-recall-locked-popover',
  standalone: true,
  imports: [PopoverFrameComponent, ButtonComponent],
  templateUrl: './save-recall-locked-popover.component.html',
  styleUrl: './save-recall-locked-popover.component.scss',
})
export class SaveRecallLockedPopoverComponent {
  private readonly layout = inject(LayoutService);

  onUpgrade(): void {
    this.layout.clearPopover();
    this.layout.setRightPanel(UpgradePanelComponent);
  }
}
