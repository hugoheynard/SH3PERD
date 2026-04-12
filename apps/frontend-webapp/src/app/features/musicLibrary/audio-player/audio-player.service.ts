import { computed, inject, Injectable, signal } from '@angular/core';
import { MusicTrackApiService } from '../services/music-track-api.service';
import { ToastService } from '../../../shared/toast/toast.service';
import type {
  TPlayableTrack,
  TLoopMode,
  TPlaybackStatus,
} from './audio-player.types';

/**
 * Global audio player service — singleton state for the docked player
 * bar mounted in the main layout.
 *
 * ## Design
 *
 * The service owns:
 * - The queue of `TPlayableTrack` items.
 * - The cursor pointing at the current track in the queue.
 * - The playback status (`idle` / `loading` / `playing` / `paused` / `error`).
 * - Position, duration, volume, mute, loop mode, cached presigned URLs.
 *
 * The `AudioPlayerBarComponent` reads all of the above through signals
 * and forwards user intents (play, pause, seek, next, prev) back to
 * this service. Everything DOM-level (wavesurfer instance, click-to-seek,
 * keyboard shortcuts) lives in the component; the service is
 * transport-agnostic so it can be unit-tested without any audio engine.
 *
 * ## Presigned URL cache
 *
 * Track URLs are fetched from the backend on demand and cached in memory
 * for their TTL (backend expires them after 1 h). We keep the cache
 * ever-growing within the session — at most a few hundred entries per
 * hour, cleared on reload. A future iteration can add an LRU eviction.
 *
 * ## Concurrency
 *
 * Every call to `playTrack` / `playQueue` bumps an internal load token.
 * When an async URL fetch resolves, it checks its token against the
 * current one — if the user has clicked another track in the meantime,
 * the stale fetch is dropped, avoiding the classic "wrong song plays
 * after rapid clicks" race.
 */
@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private readonly trackApi = inject(MusicTrackApiService);
  private readonly toast = inject(ToastService);

  // ── State signals (public read, private write) ─────────────────

  private readonly _queue = signal<TPlayableTrack[]>([]);
  private readonly _cursor = signal<number>(-1);
  private readonly _status = signal<TPlaybackStatus>('idle');
  private readonly _position = signal<number>(0);
  private readonly _duration = signal<number>(0);
  private readonly _volume = signal<number>(1);
  private readonly _muted = signal<boolean>(false);
  private readonly _loopMode = signal<TLoopMode>('off');
  /** Current track's resolved presigned URL, or null if not yet loaded. */
  private readonly _currentUrl = signal<string | null>(null);

  readonly queue = this._queue.asReadonly();
  readonly cursor = this._cursor.asReadonly();
  readonly status = this._status.asReadonly();
  readonly position = this._position.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly volume = this._volume.asReadonly();
  readonly muted = this._muted.asReadonly();
  readonly loopMode = this._loopMode.asReadonly();
  readonly currentUrl = this._currentUrl.asReadonly();

  // ── Derived selectors ───────────────────────────────────────────

  /** The track at the current cursor position, or null if the queue is empty. */
  readonly currentTrack = computed<TPlayableTrack | null>(() => {
    const queue = this._queue();
    const cursor = this._cursor();
    if (cursor < 0 || cursor >= queue.length) return null;
    return queue[cursor];
  });

  readonly isPlaying = computed(() => this._status() === 'playing');
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly hasTrack = computed(() => this.currentTrack() !== null);

  readonly canGoPrevious = computed(
    () => this._queue().length > 1 && this._cursor() > 0,
  );
  readonly canGoNext = computed(() => {
    const queue = this._queue();
    const cursor = this._cursor();
    const loop = this._loopMode();
    if (queue.length === 0) return false;
    if (loop === 'queue') return queue.length > 1;
    return cursor < queue.length - 1;
  });

  // ── URL cache ───────────────────────────────────────────────────

  private readonly urlCache = new Map<string, { url: string; fetchedAt: number }>();
  private static readonly URL_TTL_MS = 55 * 60 * 1000; // backend expires after 1h, leave a 5-min safety margin

  /** Monotonic load token — used to ignore stale URL fetches. */
  private loadToken = 0;

  // ── Public API ─────────────────────────────────────────────────

  /**
   * Plays a single track. If it's already the current track, toggles
   * play/pause instead of restarting. Clears any existing queue.
   */
  playTrack(track: TPlayableTrack): void {
    const current = this.currentTrack();
    if (current && current.id === track.id) {
      this.togglePlayPause();
      return;
    }
    this._queue.set([track]);
    this._cursor.set(0);
    this.loadAndPlayCurrent();
  }

  /**
   * Replaces the queue with `tracks` and starts playback at `startIndex`
   * (defaults to 0). Used for "play all" actions on a tab / filtered set.
   */
  playQueue(tracks: TPlayableTrack[], startIndex: number = 0): void {
    if (tracks.length === 0) {
      this.toast.show('Nothing to play', 'info');
      return;
    }
    const clamped = Math.max(0, Math.min(startIndex, tracks.length - 1));
    this._queue.set([...tracks]);
    this._cursor.set(clamped);
    this.loadAndPlayCurrent();
  }

  /** Appends tracks to the end of the current queue. */
  enqueue(tracks: TPlayableTrack[]): void {
    if (tracks.length === 0) return;
    this._queue.update((q) => [...q, ...tracks]);
    // If nothing was playing, start the first appended track.
    if (this._cursor() < 0) {
      this._cursor.set(this._queue().length - tracks.length);
      this.loadAndPlayCurrent();
    }
  }

  /** Toggles between `playing` and `paused`. Loads the URL if needed. */
  togglePlayPause(): void {
    const status = this._status();
    if (status === 'idle' || status === 'error') {
      if (this.currentTrack()) this.loadAndPlayCurrent();
      return;
    }
    if (status === 'playing') {
      this._status.set('paused');
    } else if (status === 'paused') {
      this._status.set('playing');
    }
    // `loading` → let the bar auto-play when it transitions.
  }

  /** Advances to the next track, honoring the loop mode. */
  next(): void {
    const queue = this._queue();
    if (queue.length === 0) return;

    const loop = this._loopMode();
    if (loop === 'one') {
      // Repeat current track — reset position + reload.
      this._position.set(0);
      this.loadAndPlayCurrent();
      return;
    }

    const cursor = this._cursor();
    let nextIndex = cursor + 1;
    if (nextIndex >= queue.length) {
      if (loop === 'queue') {
        nextIndex = 0;
      } else {
        // End of queue — stop.
        this.stop();
        return;
      }
    }
    this._cursor.set(nextIndex);
    this.loadAndPlayCurrent();
  }

  /**
   * Goes to the previous track. Matches player-convention behavior:
   * if we're more than 3 s into the current track, restart it first.
   * A second press within 3 s jumps to the real previous track.
   */
  previous(): void {
    if (this._position() > 3) {
      this._position.set(0);
      this.loadAndPlayCurrent();
      return;
    }
    const cursor = this._cursor();
    if (cursor <= 0) {
      if (this._loopMode() === 'queue') {
        this._cursor.set(this._queue().length - 1);
        this.loadAndPlayCurrent();
      } else {
        this._position.set(0);
        this.loadAndPlayCurrent();
      }
      return;
    }
    this._cursor.set(cursor - 1);
    this.loadAndPlayCurrent();
  }

  /** Fully stops playback and clears the queue. */
  stop(): void {
    this.loadToken++;
    this._queue.set([]);
    this._cursor.set(-1);
    this._status.set('idle');
    this._position.set(0);
    this._duration.set(0);
    this._currentUrl.set(null);
  }

  /** Seeks to `seconds`, clamped to [0, duration]. */
  seek(seconds: number): void {
    const dur = this._duration();
    if (dur === 0) return;
    this._position.set(Math.max(0, Math.min(seconds, dur)));
  }

  setVolume(volume: number): void {
    this._volume.set(Math.max(0, Math.min(1, volume)));
  }

  toggleMute(): void {
    this._muted.update((m) => !m);
  }

  toggleLoopMode(): void {
    this._loopMode.update((m) => (m === 'off' ? 'queue' : m === 'queue' ? 'one' : 'off'));
  }

  // ── Callbacks from the player component ───────────────────────

  /**
   * Reported by `AudioPlayerBarComponent` when wavesurfer's `ready`
   * event fires — we learn the true duration here rather than
   * trusting the analysis snapshot value (which may be absent or
   * truncated).
   */
  notifyReady(durationSeconds: number): void {
    this._duration.set(durationSeconds);
    this._status.set('playing');
  }

  /** Reported on each `audioprocess` / `timeupdate` tick. */
  notifyTick(positionSeconds: number): void {
    this._position.set(positionSeconds);
  }

  /** Reported when playback ends without interruption. */
  notifyEnded(): void {
    this.next();
  }

  /**
   * Reported on any fatal playback failure. We surface the error via the
   * toast service and drop the status to `error` so the UI can show a
   * retry affordance. The cached URL is invalidated in case it expired.
   */
  notifyError(trackId: string, message?: string): void {
    const track = this.currentTrack();
    if (track) this.urlCache.delete(track.id);
    this._status.set('error');
    this.toast.show(`Playback failed${message ? `: ${message}` : ''}`, 'error');
    // eslint-disable-next-line no-console
    console.error('[audio-player] error', trackId, message);
  }

  /** Reported when wavesurfer pauses on its own (end of buffer, etc.). */
  notifyPaused(): void {
    if (this._status() === 'playing') this._status.set('paused');
  }

  // ── Internals ─────────────────────────────────────────────────

  /**
   * Loads the presigned URL for the current track (from cache if fresh)
   * and flips the status to `loading`. The `AudioPlayerBarComponent`
   * reacts via an effect() and calls wavesurfer.load(...) with the URL.
   */
  private loadAndPlayCurrent(): void {
    const track = this.currentTrack();
    if (!track) return;

    const token = ++this.loadToken;
    this._status.set('loading');
    this._position.set(0);
    this._duration.set(track.durationSeconds ?? 0);
    this._currentUrl.set(null);

    const cached = this.urlCache.get(track.id);
    if (cached && Date.now() - cached.fetchedAt < AudioPlayerService.URL_TTL_MS) {
      // URL still fresh — skip the network round trip.
      this._currentUrl.set(cached.url);
      return;
    }

    this.trackApi.getDownloadUrl(track.versionId, track.id).subscribe({
      next: (url) => {
        // Drop stale fetches — the user may have clicked another track.
        if (token !== this.loadToken) return;
        this.urlCache.set(track.id, { url, fetchedAt: Date.now() });
        this._currentUrl.set(url);
      },
      error: () => {
        if (token !== this.loadToken) return;
        this.notifyError(track.id, 'failed to fetch presigned URL');
      },
    });
  }
}
