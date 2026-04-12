import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  HostListener,
  type OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AudioPlayerService } from './audio-player.service';
import type { TPlayableTrack } from './audio-player.types';
import type { TAudioAnalysisSnapshot } from '@sh3pherd/shared-types';

/**
 * Global docked audio player bar.
 *
 * ## Responsibilities
 * - Instantiate a single `WaveSurfer` instance for the lifetime of the
 *   component and drive it from `AudioPlayerService` signals.
 * - Render playback controls (play/pause, prev, next, seek, volume,
 *   loop, mute) and forward user intent back to the service.
 * - Overlay loudness / clipping markers on the waveform using the
 *   analysis snapshot attached to the current track (when available).
 * - Stay hidden (`.is-empty`) until there's a track to play, so the
 *   bar doesn't steal vertical space from the main layout on idle.
 *
 * ## Wavesurfer lifecycle
 * - Created lazily on first playback (browser-only, never on SSR).
 * - Re-loaded on every track change via a `url` effect.
 * - Destroyed in `ngOnDestroy` to release the Web Audio nodes.
 *
 * ## SSR
 * The component lives in the main layout which is server-rendered.
 * All wavesurfer calls are gated behind `isPlatformBrowser`, so SSR
 * just renders the shell HTML without touching `window` or `AudioContext`.
 */
@Component({
  selector: 'app-audio-player-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player-bar.component.html',
  styleUrl: './audio-player-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerBarComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly player = inject(AudioPlayerService);

  @ViewChild('waveformHost', { static: false })
  private waveformHost?: ElementRef<HTMLDivElement>;

  /**
   * Dynamically loaded wavesurfer instance. Typed as `any` because the
   * library ships ESM types that TypeScript struggles to resolve under
   * `verbatimModuleSyntax` — we avoid the friction and keep the narrow
   * surface we actually use (`load`, `play`, `pause`, `seekTo`,
   * `setVolume`, `setMuted`, `destroy`, plus four event hooks).
   */
  private wavesurfer: any | null = null;

  /**
   * Guard: wavesurfer's `pause` event fires both when the user clicks
   * pause and when we programmatically pause to load a new URL. We
   * bump this flag during programmatic pauses so the event handler
   * knows to ignore them and avoid spurious `notifyPaused` callbacks.
   */
  private suppressPauseEvent = false;

  /** Cached last URL we loaded — used to avoid reloading on no-op updates. */
  private lastLoadedUrl: string | null = null;

  /**
   * Computed loudness markers for the current track's waveform.
   * Each marker is a `{ leftPct, widthPct, kind }` tuple rendered as
   * an absolute-positioned overlay inside the waveform host.
   *
   * - `clipping` — bright red stripes where `clippingRatio` spikes
   * - `loudest` — subtle highlight over the loudest 2-second window
   *   (approximated from the analysis LUFS)
   *
   * In v1 we only render a clipping indicator derived from the
   * snapshot-wide clipping ratio (backend doesn't yet expose a
   * per-window breakdown). A future iteration can trade this for a
   * richer per-frame payload.
   */
  readonly markers = computed(() => {
    const track = this.player.currentTrack();
    const snapshot = track?.analysis;
    if (!snapshot || !track?.durationSeconds) return [];
    return this.buildMarkers(snapshot);
  });

  /** Human-formatted current position (e.g. "1:23"). */
  readonly positionLabel = computed(() =>
    this.formatTime(this.player.position()),
  );

  /** Human-formatted total duration. */
  readonly durationLabel = computed(() =>
    this.formatTime(this.player.duration()),
  );

  /** `0` → `1` progress fraction for the seek bar fallback. */
  readonly progress = computed(() => {
    const duration = this.player.duration();
    if (duration === 0) return 0;
    return Math.min(1, this.player.position() / duration);
  });

  constructor() {
    // Load / reload wavesurfer whenever the service reports a new URL.
    effect(() => {
      const url = this.player.currentUrl();
      if (!this.isBrowser || !url) return;
      this.ensureWavesurfer();
      if (url !== this.lastLoadedUrl) {
        this.lastLoadedUrl = url;
        this.loadUrl(url);
      }
    });

    // Play / pause driven by the service status.
    effect(() => {
      if (!this.isBrowser || !this.wavesurfer) return;
      const status = this.player.status();
      try {
        if (status === 'playing') {
          void this.wavesurfer.play();
        } else if (status === 'paused') {
          this.suppressPauseEvent = true;
          this.wavesurfer.pause();
          this.suppressPauseEvent = false;
        }
      } catch {
        /* wavesurfer not ready yet — the ready effect will retry */
      }
    });

    // Volume + mute driven by the service state.
    effect(() => {
      if (!this.wavesurfer) return;
      this.wavesurfer.setVolume(this.player.muted() ? 0 : this.player.volume());
    });

    // Seek — only drive wavesurfer when the signal changes externally
    // (e.g. user clicks previous, which resets position to 0).
    effect(() => {
      const position = this.player.position();
      const duration = this.player.duration();
      if (!this.wavesurfer || duration === 0) return;
      const currentTime = this.wavesurfer.getCurrentTime?.() ?? 0;
      // Only seek if the gap is big enough to be user-initiated
      // (tick events create micro-drifts of <200 ms).
      if (Math.abs(currentTime - position) > 0.5) {
        this.wavesurfer.seekTo(position / duration);
      }
    });
  }

  ngAfterViewInit(): void {
    // Wavesurfer is created lazily in `ensureWavesurfer()` on first
    // playback request, so there's nothing to do here except make sure
    // the host element has been rendered for the effect chain.
  }

  ngOnDestroy(): void {
    try {
      this.wavesurfer?.destroy();
    } catch {
      /* no-op */
    }
    this.wavesurfer = null;
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

  onPlayPauseClick(): void {
    this.player.togglePlayPause();
  }

  onPreviousClick(): void {
    this.player.previous();
  }

  onNextClick(): void {
    this.player.next();
  }

  onStopClick(): void {
    this.player.stop();
  }

  onLoopClick(): void {
    this.player.toggleLoopMode();
  }

  onMuteClick(): void {
    this.player.toggleMute();
  }

  onVolumeInput(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) this.player.setVolume(value);
  }

  /**
   * Click-to-seek on the waveform. `ratio` is the horizontal click
   * position from 0 to 1. We delegate to the service so the signal
   * stays the source of truth.
   */
  onWaveformClick(event: MouseEvent): void {
    const host = this.waveformHost?.nativeElement;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const duration = this.player.duration();
    if (duration === 0) return;
    this.player.seek(ratio * duration);
    if (this.wavesurfer) {
      this.wavesurfer.seekTo(ratio);
    }
  }

  // ── Wavesurfer integration ───────────────────────────────

  private async ensureWavesurfer(): Promise<void> {
    if (this.wavesurfer || !this.isBrowser) return;
    const host = this.waveformHost?.nativeElement;
    if (!host) return;

    // Dynamic import so SSR bundles don't pull Web Audio APIs.
    const mod = await import('wavesurfer.js');
    const WaveSurfer = (mod as any).default ?? mod;

    this.wavesurfer = WaveSurfer.create({
      container: host,
      height: 40,
      waveColor: 'rgba(231, 234, 240, 0.35)',
      progressColor: '#06a4a4',
      cursorColor: 'rgba(6, 164, 164, 0.75)',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      interact: false, // we handle clicks ourselves to stay in sync with the service
      backend: 'MediaElement',
    });

    this.wavesurfer.on('ready', (durationSeconds: number) => {
      this.player.notifyReady(durationSeconds);
    });
    this.wavesurfer.on('audioprocess', (currentTime: number) => {
      this.player.notifyTick(currentTime);
    });
    this.wavesurfer.on('seeking', (currentTime: number) => {
      this.player.notifyTick(currentTime);
    });
    this.wavesurfer.on('finish', () => {
      this.player.notifyEnded();
    });
    this.wavesurfer.on('pause', () => {
      if (!this.suppressPauseEvent) this.player.notifyPaused();
    });
    this.wavesurfer.on('error', (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const track = this.player.currentTrack();
      this.player.notifyError(track?.id ?? 'unknown', message);
    });

    // Apply initial volume.
    this.wavesurfer.setVolume(this.player.muted() ? 0 : this.player.volume());
  }

  /**
   * Loads a URL into wavesurfer. When the current track carries pre-
   * computed peaks, passes them as the second argument — this tells
   * wavesurfer to draw the waveform instantly from the peaks array
   * and use the `<audio>` element for playback only (no CORS fetch
   * needed to compute the waveform).
   *
   * Falls back to a standard `load(url)` for legacy tracks without
   * peaks, which makes wavesurfer download the whole file.
   */
  private loadUrl(url: string): void {
    if (!this.wavesurfer) return;
    try {
      const track = this.player.currentTrack();
      if (track?.peaks && track.peaks.length > 0) {
        // wavesurfer.load(url, channelPeaks[], duration?)
        // channelPeaks is an array of Float32Array — one per channel.
        // We have mono peaks, so wrap in a single-element array.
        const duration = track.durationSeconds ?? undefined;
        this.wavesurfer.load(url, [Array.from(track.peaks)], duration);
      } else {
        this.wavesurfer.load(url);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const currentTrack = this.player.currentTrack();
      this.player.notifyError(currentTrack?.id ?? 'unknown', message);
    }
  }

  // ── Marker logic ─────────────────────────────────────────

  /** Marker shape used by both the template and the builder. */
  private static readonly MARKER_SHAPE = {} as {
    kind: 'clipping' | 'loudest';
    leftPct: number;
    widthPct: number;
    label: string;
  };

  /**
   * Builds the overlay markers for the waveform. Uses real peaks when
   * available (per-bucket clipping + sliding-RMS loudest window),
   * falls back to snapshot-level summary stats for legacy tracks.
   */
  private buildMarkers(snapshot: TAudioAnalysisSnapshot): Array<typeof AudioPlayerBarComponent.MARKER_SHAPE> {
    const track = this.player.currentTrack();
    const peaks = track?.peaks;

    if (peaks && peaks.length > 0) {
      return this.buildMarkersFromPeaks(peaks, snapshot);
    }

    // ── Fallback: summary-stat guesswork ────────────────────
    const markers: Array<typeof AudioPlayerBarComponent.MARKER_SHAPE> = [];

    if (snapshot.clippingRatio > 0.001) {
      markers.push({
        kind: 'clipping',
        leftPct: 0,
        widthPct: 100,
        label: `${(snapshot.clippingRatio * 100).toFixed(2)}% clipped samples`,
      });
    }

    if (snapshot.loudnessRange > 6) {
      markers.push({
        kind: 'loudest',
        leftPct: 55,
        widthPct: 20,
        label: `Dynamic range: ${snapshot.loudnessRange.toFixed(1)} LU`,
      });
    }

    return markers;
  }

  /**
   * Builds markers from real peak data. Groups adjacent clipped buckets
   * into merged regions and finds the loudest window via a sliding RMS.
   */
  private buildMarkersFromPeaks(
    peaks: Float32Array,
    snapshot: TAudioAnalysisSnapshot,
  ): Array<typeof AudioPlayerBarComponent.MARKER_SHAPE> {
    const markers: Array<typeof AudioPlayerBarComponent.MARKER_SHAPE> = [];
    const n = peaks.length;
    if (n === 0) return markers;

    const CLIP_THRESHOLD = 0.98;
    const toPct = (idx: number) => (idx / n) * 100;

    // ── Clipping regions: merge adjacent clipped buckets ─────
    let clipStart: number | null = null;
    let totalClipped = 0;
    for (let i = 0; i <= n; i++) {
      const isClipped = i < n && Math.abs(peaks[i]) >= CLIP_THRESHOLD;
      if (isClipped) {
        if (clipStart === null) clipStart = i;
        totalClipped++;
      } else if (clipStart !== null) {
        markers.push({
          kind: 'clipping',
          leftPct: toPct(clipStart),
          widthPct: Math.max(0.5, toPct(i) - toPct(clipStart)),
          label: 'Clipping detected',
        });
        clipStart = null;
      }
    }

    // Only keep clipping markers if the ratio is significant
    if (totalClipped / n < 0.0005) {
      const clippingIndices: number[] = [];
      markers.forEach((m, idx) => { if (m.kind === 'clipping') clippingIndices.push(idx); });
      for (let i = clippingIndices.length - 1; i >= 0; i--) markers.splice(clippingIndices[i], 1);
    }

    // ── Loudest window: sliding RMS over ~5 % of duration ───
    const windowSize = Math.max(10, Math.round(n * 0.05));
    let bestRms = 0;
    let bestStart = 0;

    let sumSq = 0;
    for (let i = 0; i < windowSize && i < n; i++) sumSq += peaks[i] * peaks[i];
    bestRms = sumSq / windowSize;

    for (let i = 1; i + windowSize <= n; i++) {
      sumSq -= peaks[i - 1] * peaks[i - 1];
      sumSq += peaks[i + windowSize - 1] * peaks[i + windowSize - 1];
      const rms = sumSq / windowSize;
      if (rms > bestRms) {
        bestRms = rms;
        bestStart = i;
      }
    }

    if (snapshot.loudnessRange > 4) {
      markers.push({
        kind: 'loudest',
        leftPct: toPct(bestStart),
        widthPct: Math.max(2, toPct(bestStart + windowSize) - toPct(bestStart)),
        label: `Loudest section — dynamic range: ${snapshot.loudnessRange.toFixed(1)} LU`,
      });
    }

    return markers;
  }

  // ── Formatting helpers ────────────────────────────────────

  private formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ── Template helper accessors ────────────────────────────

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
