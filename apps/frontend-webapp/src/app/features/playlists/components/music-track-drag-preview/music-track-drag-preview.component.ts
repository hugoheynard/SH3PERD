import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import type { MusicTrackDragPayload } from '../../../../core/drag-and-drop/drag.types';

/**
 * Visual shown by the global drag layer while a `music-track` is being
 * dragged. Compact "chip" representation: title + artist so the user
 * stays oriented without the full card following the cursor.
 *
 * Inputs are mapped from the `MusicTrackDragPayload` by the playlists
 * DnD init service at registration time — consumers never instantiate
 * this directly, the drag-layer renders it via NgComponentOutlet.
 */
@Component({
  selector: 'app-music-track-drag-preview',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './music-track-drag-preview.component.html',
  styleUrl: './music-track-drag-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicTrackDragPreviewComponent {
  readonly title = input.required<string>();
  readonly artist = input.required<string>();
}

/** Input mapping used by the DragPreviewRegistryService registration. */
export function mapMusicTrackInputs(
  data: MusicTrackDragPayload,
): Record<string, unknown> {
  return { title: data.title, artist: data.artist };
}
