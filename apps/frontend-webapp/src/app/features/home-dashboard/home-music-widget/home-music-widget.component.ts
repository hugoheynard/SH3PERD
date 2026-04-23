import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
  afterNextRender,
  effect,
} from '@angular/core';
import type { TMusicPlayerWidgetConfig } from '@sh3pherd/shared-types';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AudioPlayerService } from '../../../features/musicLibrary/audio-player/audio-player.service';
import type { TPlayableTrack } from '../../../features/musicLibrary/audio-player/audio-player.types';
import { MusicPickerDialogComponent } from '../music-picker-dialog/music-picker-dialog.component';
import { WIDGET_CONTEXT } from '../widget-context';

/**
 * Home dashboard music widget — MVP.
 *
 * Rectangular widget driving {@link AudioPlayerService}. Shows the
 * currently configured track, a play/pause + repeat control, and a
 * progress line that traces the widget's outline as the track plays.
 *
 * The widget does NOT own an audio engine. It owns a single
 * `TPlayableTrack` reference (via inputs, later persisted in the
 * widget config) and mirrors it into the global player when the user
 * hits play. Reading back position / status comes straight from the
 * service — so the progress contour reflects the _actual_ player, not
 * a local copy.
 */
@Component({
  selector: 'app-home-music-widget',
  standalone: true,
  imports: [IconComponent, MusicPickerDialogComponent],
  templateUrl: './home-music-widget.component.html',
  styleUrl: './home-music-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeMusicWidgetComponent {
  /**
   * Typed widget config — persisted by the dashboard layout store and
   * forwarded through `ngComponentOutlet`. Carries the pinned track
   * reference plus display metadata. Optional: an unconfigured widget
   * renders the `empty` state and exposes the "Choose track" action.
   */
  readonly config = input<TMusicPlayerWidgetConfig | undefined>(undefined);

  private readonly player = inject(AudioPlayerService);
  /**
   * Per-instance context provided by the grid. Optional so the widget
   * can still render when rendered outside a grid (tests, Storybook),
   * but without a context it can't persist its picks.
   */
  private readonly widgetCtx = inject(WIDGET_CONTEXT, { optional: true });
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  /** Widget box size — used to compute the SVG contour perimeter. */
  private readonly box = signal<{ w: number; h: number }>({ w: 0, h: 0 });

  /** Whether the music picker modal is open. */
  readonly pickerOpen = signal(false);

  /**
   * Derived `TPlayableTrack` for the global player. Requires both a
   * `versionId` and a `trackId` in the config — anything less is an
   * incomplete pin and the widget stays in `empty` state.
   */
  readonly track = computed<TPlayableTrack | undefined>(() => {
    const cfg = this.config();
    if (!cfg?.versionId || !cfg?.trackId) return undefined;
    return {
      id: cfg.trackId,
      versionId: cfg.versionId,
      fileName: cfg.title ?? 'Track',
      title: cfg.title,
      subtitle: cfg.subtitle,
    };
  });

  /** True when this widget's track is the one currently mounted in the player. */
  readonly isCurrent = computed(() => {
    const current = this.player.currentTrack();
    const mine = this.track();
    return !!current && !!mine && current.id === mine.id;
  });

  /** Exposed state — only meaningful when `isCurrent`. */
  readonly isPlaying = computed(
    () => this.isCurrent() && this.player.isPlaying(),
  );
  readonly isLoading = computed(
    () => this.isCurrent() && this.player.isLoading(),
  );
  readonly loopMode = this.player.loopMode;

  /** `empty` | `ready` | `loading` | `playing` | `paused`. */
  readonly status = computed<
    'empty' | 'ready' | 'loading' | 'playing' | 'paused'
  >(() => {
    if (!this.track()) return 'empty';
    if (!this.isCurrent()) return 'ready';
    if (this.player.isLoading()) return 'loading';
    if (this.player.isPlaying()) return 'playing';
    return 'paused';
  });

  /** Display-ready title (falls back to file name). */
  readonly title = computed(() => {
    const t = this.track();
    if (!t) return 'No track';
    return t.title ?? t.fileName;
  });

  readonly subtitle = computed(() => this.track()?.subtitle ?? '');

  /** 0 → 1 progress ratio. Zero when we're not the active track. */
  readonly progress = computed(() => {
    if (!this.isCurrent()) return 0;
    const duration = this.player.duration();
    if (duration <= 0) return 0;
    return Math.min(1, Math.max(0, this.player.position() / duration));
  });

  /** SVG perimeter length — used to drive `stroke-dashoffset`. */
  readonly perimeter = computed(() => {
    const { w, h } = this.box();
    if (w <= 0 || h <= 0) return 0;
    // Rect with 10 px corner radius (matches --radius-md): perimeter approx.
    const r = 10;
    return 2 * (w + h) - 8 * r + 2 * Math.PI * r;
  });

  readonly dashOffset = computed(() => {
    const p = this.perimeter();
    return p * (1 - this.progress());
  });

  readonly boxSize = this.box.asReadonly();

  constructor() {
    afterNextRender(() => this.measureBox());
    // Re-measure whenever the track changes (widget may resize after empty → ready).
    effect(() => {
      this.track();
      queueMicrotask(() => this.measureBox());
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.measureBox();
  }

  private measureBox(): void {
    const el = this.root().nativeElement;
    const rect = el.getBoundingClientRect();
    this.box.set({ w: Math.round(rect.width), h: Math.round(rect.height) });
  }

  togglePlay(): void {
    const t = this.track();
    if (!t) {
      this.chooseTrack();
      return;
    }
    if (this.isCurrent()) {
      this.player.togglePlayPause();
      return;
    }
    this.player.playTrack(t);
  }

  toggleRepeat(): void {
    this.player.toggleLoopMode();
  }

  chooseTrack(): void {
    this.pickerOpen.set(true);
  }

  onPickerSelected(config: TMusicPlayerWidgetConfig): void {
    this.pickerOpen.set(false);
    this.widgetCtx?.requestDataUpdate(config);
  }

  onPickerCancelled(): void {
    this.pickerOpen.set(false);
  }
}
