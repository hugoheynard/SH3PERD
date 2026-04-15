import { effect, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AudioPlayerService } from './audio-player.service';

/**
 * Adapter between `AudioPlayerService` (transport-agnostic state) and
 * the concrete audio engine — `wavesurfer.js`.
 *
 * The component only knows this service exists. Wavesurfer's API,
 * dynamic import, event wiring, peak handling and load-timeout safety
 * net all live here.
 *
 * ## Lifecycle
 *
 * 1. Component calls `attach(host)` after its view has been rendered.
 *    A wavesurfer instance is lazily created on the first **playback
 *    request** (not on `attach`) so SSR / idle routes never touch Web
 *    Audio APIs.
 * 2. Signal effects (created once in the constructor) drive wavesurfer
 *    when the service state changes: new URL → load, status → play/pause,
 *    volume/mute → setVolume, position → seek.
 * 3. Wavesurfer events flow back through `AudioPlayerService.notify*`.
 * 4. Component calls `detach()` on destroy → wavesurfer is torn down,
 *    load timeout cleared.
 *
 * ## Why a singleton
 *
 * The docked player bar is mounted once in the main layout. Making this
 * service `providedIn: 'root'` keeps wavesurfer alive across route
 * navigations (the bar doesn't unmount when the user changes pages).
 * If the bar ever becomes conditionally mounted, swap to component-level
 * injection and the lifecycle still works — `attach`/`detach` are the
 * only boundary.
 */
@Injectable({ providedIn: 'root' })
export class WavesurferAdapterService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly player = inject(AudioPlayerService);

  /**
   * The wavesurfer instance. Typed as `any` because the library's ESM
   * types trip up `verbatimModuleSyntax`. We only call a narrow set of
   * methods: `load`, `play`, `pause`, `seekTo`, `setVolume`, `destroy`.
   */
  private wavesurfer: any | null = null;
  private host: HTMLElement | null = null;

  /**
   * Wavesurfer's `pause` event fires both on user action and during
   * programmatic pauses (e.g. loading a new URL). We bump this flag
   * during programmatic pauses so the handler doesn't echo a spurious
   * `notifyPaused()` back to the service.
   */
  private suppressPauseEvent = false;

  /** Last URL loaded — skips reloads on no-op URL updates. */
  private lastLoadedUrl: string | null = null;

  /** Timeout fired 30 s after load if `ready` never arrives. */
  private loadTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // ── Effect 1: URL load ─────────────────────────────────
    // When the service reports a new URL, load it into wavesurfer.
    effect(() => {
      const url = this.player.currentUrl();
      if (!this.isBrowser || !url) return;
      void this.ensureWavesurfer().then(() => {
        if (url !== this.lastLoadedUrl) {
          this.lastLoadedUrl = url;
          this.loadUrl(url);
        }
      });
    });

    // ── Effect 2: play / pause ─────────────────────────────
    // IMPORTANT: read the status signal BEFORE the wavesurfer guard —
    // Angular effects only track signals read during execution. If we
    // return early before reading `status()`, the effect never re-fires
    // when the status changes.
    effect(() => {
      const status = this.player.status();
      if (!this.isBrowser || !this.wavesurfer) return;
      if (status === 'playing') {
        this.wavesurfer.play().catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('[wavesurfer-adapter] play() rejected:', msg);
          const track = this.player.currentTrack();
          this.player.notifyError(track?.id ?? 'unknown', msg);
        });
      } else if (status === 'paused') {
        this.suppressPauseEvent = true;
        this.wavesurfer.pause();
        this.suppressPauseEvent = false;
      }
    });

    // ── Effect 3: volume / mute ───────────────────────────
    effect(() => {
      const vol = this.player.muted() ? 0 : this.player.volume();
      if (!this.wavesurfer) return;
      this.wavesurfer.setVolume(vol);
    });

    // ── Effect 4: seek on external position changes ───────
    // Only drive wavesurfer when the gap exceeds 0.5 s — wavesurfer's
    // own tick events create micro-drifts (<200 ms) we must ignore.
    effect(() => {
      const position = this.player.position();
      const duration = this.player.duration();
      if (!this.wavesurfer || duration === 0) return;
      const currentTime = this.wavesurfer.getCurrentTime?.() ?? 0;
      if (Math.abs(currentTime - position) > 0.5) {
        this.wavesurfer.seekTo(position / duration);
      }
    });
  }

  /** Binds wavesurfer's render target. Call once, after the view is ready. */
  attach(host: HTMLElement): void {
    this.host = host;
  }

  /** Tears down wavesurfer + clears pending timeouts. Call on component destroy. */
  detach(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
    try {
      this.wavesurfer?.destroy();
    } catch {
      /* no-op */
    }
    this.wavesurfer = null;
    this.host = null;
    this.lastLoadedUrl = null;
  }

  /**
   * Imperative seek used by click-to-seek on the waveform. The service
   * state is updated separately; this call makes the visual cursor jump
   * to the new ratio instantly instead of waiting for the next tick.
   */
  seekToRatio(ratio: number): void {
    this.wavesurfer?.seekTo(ratio);
  }

  // ─── internals ─────────────────────────────────────────

  private async ensureWavesurfer(): Promise<void> {
    if (this.wavesurfer || !this.isBrowser || !this.host) return;

    // Dynamic import so SSR bundles don't pull Web Audio APIs.
    const mod = await import('wavesurfer.js');
    const WaveSurfer = (mod as any).default ?? mod;

    this.wavesurfer = WaveSurfer.create({
      container: this.host,
      height: 40,
      waveColor: 'rgba(231, 234, 240, 0.35)',
      progressColor: '#06a4a4',
      cursorColor: 'rgba(6, 164, 164, 0.75)',
      cursorWidth: 1,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      normalize: true,
      interact: false, // clicks are handled by the component to stay in sync
      backend: 'MediaElement',
    });

    this.wavesurfer.on('ready', (durationSeconds: number) => {
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
      }
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
   * Loads a URL into wavesurfer. When the track carries pre-computed
   * peaks, they're passed as the second argument — wavesurfer draws the
   * waveform instantly from the peaks array and uses the `<audio>`
   * element for playback only (no CORS fetch required to compute the
   * waveform). Falls back to a vanilla `load(url)` for legacy tracks.
   */
  private loadUrl(url: string): void {
    if (!this.wavesurfer) return;

    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    try {
      const track = this.player.currentTrack();
      if (track?.peaks && track.peaks.length > 0) {
        // Pass peaks, but NOT duration — forcing wavesurfer to wait for
        // the <audio> `loadedmetadata` event before firing `ready`.
        // Passing duration would make `ready` fire synchronously, which
        // triggers play() before the media is actually available.
        this.wavesurfer.load(url, [Array.from(track.peaks)]);
      } else {
        this.wavesurfer.load(url);
      }

      // Safety net: if `ready` never fires (CORS, network), surface an
      // error after 30 s so the UI doesn't spin forever.
      this.loadTimeout = setTimeout(() => {
        if (this.player.status() === 'loading') {
          const track = this.player.currentTrack();
          this.player.notifyError(
            track?.id ?? 'unknown',
            'Audio load timed out — the file may be inaccessible (CORS or network issue)',
          );
        }
      }, 30_000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const track = this.player.currentTrack();
      this.player.notifyError(track?.id ?? 'unknown', message);
    }
  }
}
