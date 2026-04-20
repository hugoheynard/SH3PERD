import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../../../shared/icon/icon.component';
import type { PlaylistDragPayload } from '../../../../core/drag-and-drop/drag.types';
import type { TPlaylistColor } from '@sh3pherd/shared-types';

/**
 * Visual shown by the global drag layer while a `playlist` is being
 * dragged. Compact chip — playlist name + track count — with a color
 * stripe that matches the source card so the user keeps the identity
 * mapping while crossing from the playlists grid to a show's section.
 *
 * Inputs are mapped from the `PlaylistDragPayload` by the shows DnD
 * init service at registration time — consumers never instantiate this
 * directly, the drag-layer renders it via NgComponentOutlet.
 */
@Component({
  selector: 'app-playlist-drag-preview',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './playlist-drag-preview.component.html',
  styleUrl: './playlist-drag-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistDragPreviewComponent {
  readonly name = input.required<string>();
  readonly color = input.required<TPlaylistColor>();
  readonly trackCount = input.required<number>();
}

/** Input mapping used by the DragPreviewRegistryService registration. */
export function mapPlaylistInputs(
  data: PlaylistDragPayload,
): Record<string, unknown> {
  return {
    name: data.name,
    color: data.color,
    trackCount: data.trackCount,
  };
}
