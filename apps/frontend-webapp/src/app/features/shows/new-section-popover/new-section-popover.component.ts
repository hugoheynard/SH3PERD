import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TShowId, TShowSectionTarget } from '@sh3pherd/shared-types';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { LayoutService } from '../../../core/services/layout.service';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ShowsMutationService } from '../services/shows-mutation.service';

export interface NewSectionPopoverData {
  showId: TShowId;
  defaultName: string;
}

type TargetMode = 'none' | 'duration' | 'track_count';

/**
 * Popover shown when the user hits "Add section". Replaces the
 * previous back-to-back `window.prompt()` calls (name + minutes) with
 * a proper form.
 *
 * Stays minimal on purpose: name + optional target. Richer fields
 * (description, startAt, axis criteria) live on the section settings
 * popover — easier to fill after the section exists than to jam every
 * decision into the creation path.
 */
@Component({
  selector: 'app-new-section-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PopoverFrameComponent, ButtonComponent, IconComponent],
  templateUrl: './new-section-popover.component.html',
  styleUrl: './new-section-popover.component.scss',
})
export class NewSectionPopoverComponent {
  private readonly data = inject(INJECTION_DATA) as NewSectionPopoverData;
  private readonly mutations = inject(ShowsMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly name = signal(this.data.defaultName);
  protected readonly targetMode = signal<TargetMode>('duration');
  protected readonly targetDurationMinutes = signal('15');
  protected readonly targetTrackCount = signal('5');

  protected readonly canSubmit = computed(() => this.name().trim().length > 0);

  setTargetMode(mode: TargetMode): void {
    this.targetMode.set(mode);
  }

  close(): void {
    this.layout.clearPopover();
  }

  submit(): void {
    const name = this.name().trim();
    if (!name) return;

    const mode = this.targetMode();
    let target: TShowSectionTarget | undefined;
    if (mode === 'duration') {
      const minutes = parsePositiveInt(this.targetDurationMinutes());
      if (minutes > 0) target = { mode: 'duration', duration_s: minutes * 60 };
    } else if (mode === 'track_count') {
      const count = parsePositiveInt(this.targetTrackCount());
      if (count > 0) target = { mode: 'track_count', track_count: count };
    }

    this.mutations.addSection(this.data.showId, name, target);
    this.close();
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
    if (event.key === 'Enter' && this.canSubmit()) {
      event.preventDefault();
      this.submit();
    }
  }
}

function parsePositiveInt(raw: unknown): number {
  const str = raw === null || raw === undefined ? '' : String(raw);
  const parsed = Number.parseInt(str.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
