import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TPlaylistColor } from '@sh3pherd/shared-types';
import { LayoutService } from '../../../core/services/layout.service';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ShowMutationService } from '../services/mutations-layer/show-mutation.service';

const DEFAULT_COLOR: TPlaylistColor = 'indigo';

/** Colour chips rendered in the popover — mirrors the palette used by
 *  the show cards and the playlist cards so the visual grammar stays
 *  consistent across the two features. */
const SHOW_COLORS = [
  { key: 'indigo', hex: '#818cf8' },
  { key: 'emerald', hex: '#34d399' },
  { key: 'rose', hex: '#fb7185' },
  { key: 'amber', hex: '#fbbf24' },
  { key: 'sky', hex: '#38bdf8' },
  { key: 'violet', hex: '#a78bfa' },
] as const;

/**
 * Popover shown when the user hits "New show". Collects the minimum
 * required to plan: a name, an optional colour, and an optional total
 * duration target (minutes) that drives the fill-% progress bar on the
 * show header.
 *
 * Predefining the internal structure (sections) at creation time is a
 * later concern — tracked in `documentation/todos/TODO-artist-shows.md`.
 */
@Component({
  selector: 'app-new-show-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PopoverFrameComponent, ButtonComponent, IconComponent],
  templateUrl: './new-show-popover.component.html',
  styleUrl: './new-show-popover.component.scss',
})
export class NewShowPopoverComponent {
  private readonly layout = inject(LayoutService);
  private readonly mutations = inject(ShowMutationService);

  protected readonly colors = SHOW_COLORS;

  /** Form draft signals — plain strings for the inputs, parsed at
   *  submit-time so the fields stay untouched as the user types. */
  protected readonly name = signal('');
  protected readonly totalDurationTargetMinutes = signal('60');
  protected readonly color = signal<TPlaylistColor>(DEFAULT_COLOR);

  /** Submit is enabled once the name has a non-empty trimmed value. */
  protected readonly canSubmit = computed(() => this.name().trim().length > 0);

  setColor(color: TPlaylistColor): void {
    this.color.set(color);
  }

  close(): void {
    this.layout.clearPopover();
  }

  submit(): void {
    const name = this.name().trim();
    if (!name) return;
    const minutes = Number.parseInt(
      this.totalDurationTargetMinutes().trim(),
      10,
    );
    const totalDurationTargetSeconds =
      Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : undefined;

    this.mutations.createShow({
      name,
      color: this.color(),
      totalDurationTargetSeconds,
    });
    this.close();
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.canSubmit()) {
      event.preventDefault();
      this.submit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
}
