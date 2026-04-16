import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { LayoutService } from '../../../core/services/layout.service';
import { UpgradePanelComponent } from '../../../core/components/upgrade-panel/upgrade-panel.component';

/**
 * Popover shown when the user tries to add a tab beyond their plan limit.
 *
 * Explains the limit in a sentence and hands off to the full upgrade flow
 * (right panel) on confirmation. Uses the shared `PopoverFrameComponent`
 * for the backdrop + frame + close affordance, and the global
 * `LayoutService.setPopover` / `setRightPanel` pipeline for mount/dismiss.
 */
@Component({
  selector: 'app-tab-limit-popover',
  standalone: true,
  imports: [PopoverFrameComponent, ButtonComponent],
  templateUrl: './tab-limit-popover.component.html',
  styleUrl: './tab-limit-popover.component.scss',
})
export class TabLimitPopoverComponent {
  private readonly layout = inject(LayoutService);

  onUpgrade(): void {
    this.layout.clearPopover();
    this.layout.setRightPanel(UpgradePanelComponent);
  }
}
