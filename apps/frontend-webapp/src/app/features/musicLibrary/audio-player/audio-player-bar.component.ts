import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  HostListener,
  type OnDestroy,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../../shared/utils/duration.utils';
import { AudioPlayerService } from './audio-player.service';
import { WavesurferAdapterService } from './wavesurfer-adapter.service';
import { AudioMarkerService } from './audio-marker.service';
import type { TPlayableTrack } from './audio-player.types';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';

/**
 * Global docked audio player bar — pure orchestration.
 *
 * This component is deliberately thin: it wires the view to three
 * services and forwards user input. It holds **no engine state**.
 *
 * - `AudioPlayerService` — transport state (queue, cursor, status,
 *   position, duration, volume, …). Source of truth.
 * - `WavesurferAdapterService` — owns the `WaveSurfer` instance,
 *   dynamic import, event forwarding and lifecycle. Attached here via
 *   the host `ElementRef` once the view is ready.
 * - `AudioMarkerService` — derives clipping + loudest-window overlays
 *   from the current track's analysis snapshot + peaks. Pure DSP.
 *
 * Responsibilities kept in the component:
 * - Template rendering + ViewChild on the waveform host
 * - Attach/detach of the wavesurfer adapter (view lifecycle)
 * - User input (click handlers, keyboard shortcuts)
 * - Click-to-seek translation (pixel ratio → seconds)
 * - Small view helpers (labels)
 *
 * Everything DOM-free has moved out; the component is now comfortably
 * under 150 lines and easy to scan.
 */
@Component({
  selector: 'app-audio-player-bar',
  standalone: true,
  imports: [CommonModule, ButtonIconComponent],
  templateUrl: './audio-player-bar.component.html',
  styleUrl: './audio-player-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerBarComponent implements AfterViewInit, OnDestroy {
  protected readonly player = inject(AudioPlayerService);
  private readonly wavesurfer = inject(WavesurferAdapterService);
  private readonly markerService = inject(AudioMarkerService);

  @ViewChild('waveformHost', { static: false })
  private waveformHost?: ElementRef<HTMLDivElement>;

  /** Exposed for the template — computed from peaks + snapshot by the service. */
  readonly markers = this.markerService.markers;

  /** Human-formatted current position (e.g. "1:23"). */
  readonly positionLabel = computed(() => formatTime(this.player.position()));

  /** Human-formatted total duration. */
  readonly durationLabel = computed(() => formatTime(this.player.duration()));

  /** `0` → `1` progress fraction, used as a fallback when the waveform isn't ready. */
  readonly progress = computed(() => {
    const duration = this.player.duration();
    if (duration === 0) return 0;
    return Math.min(1, this.player.position() / duration);
  });

  ngAfterViewInit(): void {
    if (this.waveformHost) {
      this.wavesurfer.attach(this.waveformHost.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.wavesurfer.detach();
  }

  // ── Keyboard shortcuts ────────────────────────────────────

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Don't hijack typing inside inputs.
    const tag = (event.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!this.player.hasTrack()) return;

    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.player.togglePlayPause();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.player.seek(this.player.position() + 5);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.player.seek(Math.max(0, this.player.position() - 5));
        break;
      case 'n':
      case 'N':
        if (this.player.canGoNext()) this.player.next();
        break;
      case 'p':
      case 'P':
        this.player.previous();
        break;
      case 'm':
      case 'M':
        this.player.toggleMute();
        break;
      default:
        break;
    }
  }

  // ── User actions ─────────────────────────────────────────

  onPlayPauseClick(): void { this.player.togglePlayPause(); }
  onPreviousClick(): void { this.player.previous(); }
  onNextClick(): void { this.player.next(); }
  onStopClick(): void { this.player.stop(); }
  onLoopClick(): void { this.player.toggleLoopMode(); }
  onMuteClick(): void { this.player.toggleMute(); }

  onVolumeInput(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) this.player.setVolume(value);
  }

  /**
   * Click-to-seek on the waveform. Converts the pixel offset to a
   * duration ratio, updates the service (source of truth) and nudges
   * wavesurfer to jump instantly so the cursor doesn't wait for the
   * next tick.
   */
  onWaveformClick(event: MouseEvent): void {
    const host = this.waveformHost?.nativeElement;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const duration = this.player.duration();
    if (duration === 0) return;
    this.player.seek(ratio * duration);
    this.wavesurfer.seekToRatio(ratio);
  }

  // ── Template helpers ─────────────────────────────────────

  getTrackTitle(track: TPlayableTrack | null): string {
    if (!track) return '';
    return track.title ?? track.fileName;
  }

  getTrackSubtitle(track: TPlayableTrack | null): string {
    if (!track) return '';
    return track.subtitle ?? '';
  }

  getLoopLabel(): string {
    const mode = this.player.loopMode();
    return mode === 'off' ? 'Loop off' : mode === 'one' ? 'Loop one' : 'Loop queue';
  }
}
