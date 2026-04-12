import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  type OnChanges,
  PLATFORM_ID,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Tiny static waveform sparkline drawn on a `<canvas>`.
 *
 * Renders a compact visual preview of a track's waveform from
 * pre-computed peaks (`Float32Array`). No audio, no wavesurfer,
 * no download — purely visual, ~0.3 ms to paint.
 *
 * ## Usage
 *
 * ```html
 * <app-waveform-thumbnail [peaks]="track.peaks" [accentColor]="'#06a4a4'" />
 * ```
 *
 * Sizing is controlled by the host via CSS (`width`, `height`). The
 * component reads its own `clientWidth` / `clientHeight` and adapts
 * the canvas resolution to match, so it stays crisp on retina displays.
 */
@Component({
  selector: 'app-waveform-thumbnail',
  standalone: true,
  template: `<canvas #canvas class="waveform-thumb"></canvas>`,
  styles: [`
    :host { display: inline-block; width: 60px; height: 20px; }
    .waveform-thumb {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 2px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaveformThumbnailComponent implements AfterViewInit, OnChanges {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Normalised peaks [0, 1]. Typically 2000 values from analysis. */
  readonly peaks = input<Float32Array | null>(null);

  /** Accent colour for the bars. Defaults to the app's teal accent. */
  readonly accentColor = input<string>('#06a4a4');

  /** Background colour — defaults to transparent. */
  readonly bgColor = input<string>('transparent');

  @ViewChild('canvas', { static: false })
  private canvasRef?: ElementRef<HTMLCanvasElement>;


  ngAfterViewInit(): void {
    this.paint();
  }

  ngOnChanges(): void {
    this.paint();
  }

  private paint(): void {
    if (!this.isBrowser) return;
    const canvas = this.canvasRef?.nativeElement;
    const peaks = this.peaks();
    if (!canvas || !peaks || peaks.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    // Fill background
    const bg = this.bgColor();
    if (bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cssW, cssH);
    }

    // Draw bars — downsample peaks to fit the pixel width
    const barCount = Math.min(peaks.length, cssW);
    const barWidth = cssW / barCount;
    const bucketSize = peaks.length / barCount;
    const midY = cssH / 2;

    ctx.fillStyle = this.accentColor();

    for (let i = 0; i < barCount; i++) {
      // Pick the max peak in this bar's bucket range
      const start = Math.floor(i * bucketSize);
      const end = Math.floor((i + 1) * bucketSize);
      let max = 0;
      for (let j = start; j < end; j++) {
        const v = Math.abs(peaks[j]);
        if (v > max) max = v;
      }

      const barH = Math.max(1, max * midY * 0.9);
      const x = i * barWidth;

      ctx.fillRect(x, midY - barH, Math.max(1, barWidth - 0.5), barH * 2);
    }

  }
}
