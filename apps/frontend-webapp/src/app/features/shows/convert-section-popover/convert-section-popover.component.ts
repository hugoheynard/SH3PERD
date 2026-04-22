import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type {
  TPlaylistColor,
  TShowId,
  TShowSectionId,
} from '@sh3pherd/shared-types';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { LayoutService } from '../../../core/services/layout.service';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ShowsMutationService } from '../services/shows-mutation.service';

export interface ConvertSectionPopoverData {
  showId: TShowId;
  sectionId: TShowSectionId;
  /** Default playlist name, pre-filled (usually `"<section name> — playlist"`). */
  defaultName: string;
}

/** Mirror of the `NewShowPopover` colour palette so a converted playlist
 *  visually matches the rest of the library. */
const PLAYLIST_COLORS = [
  { key: 'indigo', hex: '#818cf8' },
  { key: 'emerald', hex: '#34d399' },
  { key: 'rose', hex: '#fb7185' },
  { key: 'amber', hex: '#fbbf24' },
  { key: 'sky', hex: '#38bdf8' },
  { key: 'violet', hex: '#a78bfa' },
] as const;

/**
 * Popover shown when the user hits "Convert section → playlist".
 * Replaces the previous `window.prompt()` call with a proper form —
 * name is required, colour optional (falls back to whatever the
 * backend's default is when omitted).
 */
@Component({
  selector: 'app-convert-section-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PopoverFrameComponent, ButtonComponent, IconComponent],
  templateUrl: './convert-section-popover.component.html',
  styleUrl: './convert-section-popover.component.scss',
})
export class ConvertSectionPopoverComponent {
  private readonly data = inject(INJECTION_DATA) as ConvertSectionPopoverData;
  private readonly mutations = inject(ShowsMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly colors = PLAYLIST_COLORS;

  protected readonly name = signal(this.data.defaultName);
  protected readonly color = signal<TPlaylistColor>('indigo');

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
    this.mutations.convertSectionToPlaylist(
      this.data.showId,
      this.data.sectionId,
      { name, color: this.color() },
    );
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
