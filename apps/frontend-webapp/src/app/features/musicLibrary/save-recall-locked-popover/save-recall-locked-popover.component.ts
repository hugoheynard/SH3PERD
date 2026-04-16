import { Component, computed, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { LayoutService } from '../../../core/services/layout.service';
import { UpgradePanelComponent } from '../../../core/components/upgrade-panel/upgrade-panel.component';
import { UserContextService } from '../../../core/services/user-context.service';

/**
 * Popover shown when the user clicks the locked save / new-config
 * affordance. The copy adapts to why the lock fired:
 *
 * - **Free plan** — save/recall isn't included in the plan at all.
 * - **Pro at config cap** — the plan includes save/recall but the user
 *   has hit the max number of saved configurations.
 *
 * Both cases hand off to the shared upgrade right panel via
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
  private readonly userCtx = inject(UserContextService);

  /** Feature-gate case vs quota-cap case. */
  readonly isFeatureGated = computed(() => this.userCtx.plan() === 'artist_free');

  onUpgrade(): void {
    this.layout.clearPopover();
    this.layout.setRightPanel(UpgradePanelComponent);
  }
}
