import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InfoDirective } from '../../../shared/help/info.directive';

/**
 * Hidden component that registers the music library page's help entries.
 *
 * Each `<ng-container sh3Info=…>` declaration uses `InfoDirective` to push
 * an entry into `HelpRegistryService` on init and pop it on destroy. The
 * generic `HelpPanelComponent` (opened from the header help button)
 * displays whatever is currently registered.
 *
 * This component renders no DOM of its own — it exists purely so the
 * music-library-page template stays focused on layout, while the help
 * catalogue lives next to (and ships with) the page that owns it.
 *
 * Drop `<app-music-library-help />` once anywhere inside the page.
 */
@Component({
  selector: 'app-music-library-help',
  standalone: true,
  imports: [InfoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container
      sh3Info="mastery-rating" sh3InfoLabel="Mastery (MST)" sh3InfoGroup="music-library"
      sh3InfoDesc="How well you know the piece — 1 (learning) to 4 (performance-ready)."
    />
    <ng-container
      sh3Info="energy-rating" sh3InfoLabel="Energy (NRG)" sh3InfoGroup="music-library"
      sh3InfoDesc="The energy level of your version — 1 (calm) to 4 (explosive)."
    />
    <ng-container
      sh3Info="effort-rating" sh3InfoLabel="Effort (EFF)" sh3InfoGroup="music-library"
      sh3InfoDesc="How much effort this piece requires — 1 (easy) to 4 (extremely demanding)."
    />
    <ng-container
      sh3Info="quality-rating" sh3InfoLabel="Quality (QLT)" sh3InfoGroup="music-library"
      sh3InfoDesc="Audio quality auto-scored from analysis: LUFS, true peak, SNR, and clipping ratio. Shown from the favorite track."
    />
    <ng-container
      sh3Info="favorite-track" sh3InfoLabel="Favorite track ★" sh3InfoGroup="music-library"
      sh3InfoDesc="The track used as reference for quality, duration, and downloads. Click the star to change it."
    />
    <ng-container
      sh3Info="tracks-upload" sh3InfoLabel="Tracks &amp; upload" sh3InfoGroup="music-library"
      sh3InfoDesc="Each version can have multiple audio tracks. Upload a track with '+ Track' — analysis runs automatically."
    />
  `,
})
export class MusicLibraryHelpComponent {}
