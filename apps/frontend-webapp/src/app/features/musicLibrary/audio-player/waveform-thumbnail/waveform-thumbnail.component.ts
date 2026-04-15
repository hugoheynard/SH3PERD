import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  effect,
  inject,
  input,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { paintWaveform } from './paint-waveform';

/**
 * Tiny static waveform sparkline drawn on a `<canvas>`.
 *
 * Renders a compact visual preview of a track's waveform from
 * pre-computed peaks (`Float32Array`). No audio, no wavesurfer, no
 * download — purely visual, ~0.3 ms to paint.
 *
 * Sizing is controlled by the host via CSS (`width`, `height`). The
 * component reads its own `clientWidth` / `clientHeight` and adapts the
 * canvas resolution to match, so it stays crisp on retina displays.
 *
 * @example
 * ```html
 * <app-waveform-thumbnail [peaks]="track.peaks" accentColor="#06a4a4" />
 * ```
 */
@Component({
  selector: 'app-waveform-thumbnail',
  standalone: true,
  templateUrl: './waveform-thumbnail.component.html',
  styleUrl: './waveform-thumbnail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaveformThumbnailComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Normalised peaks [0, 1]. Typically 2000 values from the analysis pipeline. */
  readonly peaks = input<Float32Array | null>(null);

  /** Accent colour for the bars. Defaults to the app's teal accent. */
  readonly accentColor = input<string>('#06a4a4');

  /** Background colour — defaults to transparent (no fillRect). */
  readonly bgColor = input<string>('transparent');

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    // Re-paint whenever any input signal changes AND the canvas is mounted.
    // effect() replaces the old OnChanges + ngAfterViewInit combo and plays
    // nicely with signal inputs — no manual dep tracking, no stale captures.
    effect(() => {
      if (!this.isBrowser) return;
      const canvas = this.canvasRef()?.nativeElement;
      const peaks = this.peaks();
      if (!canvas || !peaks || peaks.length === 0) return;

      paintWaveform(canvas, peaks, {
        accentColor: this.accentColor(),
        bgColor: this.bgColor(),
      });
    });
  }
}
