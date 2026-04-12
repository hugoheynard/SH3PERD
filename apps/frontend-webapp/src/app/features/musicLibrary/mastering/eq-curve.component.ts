import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { TAiMasterPredictedParams } from './mastering.types';

/**
 * SVG visualisation of a 6-band parametric EQ curve.
 *
 * Draws the frequency response from 20 Hz to 20 kHz using the
 * predicted EQ parameters from DeepAFx-ST. Each band is rendered
 * as a bell/shelf shape whose amplitude, center frequency, and
 * bandwidth are derived from the gain, freq, and Q values.
 *
 * The composite curve (sum of all bands) is drawn as a filled area
 * above/below the 0 dB line, so boosted frequencies are teal and
 * cut frequencies are red — instantly readable.
 *
 * Used in the mastering modal to show "what the AI did" after a
 * mastering job completes.
 */
@Component({
  selector: 'sh3-eq-curve',
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      [attr.width]="width"
      [attr.height]="height"
      class="eq-curve"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Grid lines -->
      @for (line of gridLines(); track line.y) {
        <line [attr.x1]="0" [attr.y1]="line.y" [attr.x2]="width" [attr.y2]="line.y"
          stroke="rgba(255,255,255,0.06)" stroke-width="0.5" />
        <text [attr.x]="4" [attr.y]="line.y - 2" class="eq-grid-label">{{ line.label }}</text>
      }

      <!-- Frequency markers -->
      @for (marker of freqMarkers(); track marker.x) {
        <line [attr.x1]="marker.x" [attr.y1]="0" [attr.x2]="marker.x" [attr.y2]="height"
          stroke="rgba(255,255,255,0.04)" stroke-width="0.5" />
        <text [attr.x]="marker.x" [attr.y]="height - 2" class="eq-freq-label" text-anchor="middle">{{ marker.label }}</text>
      }

      <!-- 0 dB reference line -->
      <line [attr.x1]="0" [attr.y1]="midY" [attr.x2]="width" [attr.y2]="midY"
        stroke="rgba(255,255,255,0.15)" stroke-width="1" />

      <!-- Composite EQ curve fill -->
      @if (curvePath()) {
        <path [attr.d]="fillPath()" fill="url(#eqGrad)" opacity="0.35" />
        <path [attr.d]="curvePath()" fill="none" stroke="#06a4a4" stroke-width="1.5" />
      }

      <!-- Gradient defs -->
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06a4a4" stop-opacity="0.4" />
          <stop offset="50%" stop-color="#06a4a4" stop-opacity="0" />
          <stop offset="50%" stop-color="#fc8181" stop-opacity="0" />
          <stop offset="100%" stop-color="#fc8181" stop-opacity="0.3" />
        </linearGradient>
      </defs>

      <!-- Band markers -->
      @for (band of bandMarkers(); track band.x) {
        <circle [attr.cx]="band.x" [attr.cy]="band.y" r="3"
          [attr.fill]="band.gain >= 0 ? '#06a4a4' : '#fc8181'" opacity="0.8" />
        <text [attr.x]="band.x" [attr.y]="band.y + (band.gain >= 0 ? -8 : 14)"
          class="eq-band-label" text-anchor="middle">
          {{ band.gain > 0 ? '+' : '' }}{{ band.gain.toFixed(1) }} dB
        </text>
      }
    </svg>
  `,
  styles: [`
    :host { display: block; }
    .eq-curve { border-radius: 8px; background: rgba(0, 0, 0, 0.25); }
    .eq-grid-label { font-size: 7px; fill: rgba(255,255,255,0.3); font-family: monospace; }
    .eq-freq-label { font-size: 7px; fill: rgba(255,255,255,0.25); font-family: monospace; }
    .eq-band-label { font-size: 8px; fill: rgba(231,234,240,0.7); font-weight: 600; font-family: -apple-system, system-ui, sans-serif; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqCurveComponent {

  readonly params = input<TAiMasterPredictedParams['eq'] | null>(null);

  readonly width = 400;
  readonly height = 140;
  readonly midY = 70;
  private readonly dbRange = 24; // ±24 dB visible range
  private readonly minFreq = 20;
  private readonly maxFreq = 20000;
  private readonly resolution = 200; // number of x-axis sample points

  readonly gridLines = computed(() => {
    const lines: { y: number; label: string }[] = [];
    for (const db of [-18, -12, -6, 6, 12, 18]) {
      lines.push({ y: this.dbToY(db), label: `${db > 0 ? '+' : ''}${db}` });
    }
    return lines;
  });

  readonly freqMarkers = computed(() => {
    const freqs = [100, 500, 1000, 5000, 10000];
    return freqs.map(f => ({
      x: this.freqToX(f),
      label: f >= 1000 ? `${f / 1000}k` : `${f}`,
    }));
  });

  readonly curvePath = computed(() => {
    const bands = this.params();
    if (!bands || bands.length === 0) return '';
    return this.computeCurvePath(bands);
  });

  readonly bandMarkers = computed(() => {
    const bands = this.params();
    if (!bands) return [];
    return bands.map(b => ({
      x: this.freqToX(b.freq),
      y: this.dbToY(b.gain),
      gain: b.gain,
    }));
  });

  fillPath(): string {
    const curve = this.curvePath();
    if (!curve) return '';
    // Close the path back to the baseline (0 dB line)
    return `${curve} L ${this.width} ${this.midY} L 0 ${this.midY} Z`;
  }

  // ── Math ──────────────────────────────────────────────

  private freqToX(freq: number): number {
    const logMin = Math.log10(this.minFreq);
    const logMax = Math.log10(this.maxFreq);
    const logF = Math.log10(Math.max(this.minFreq, Math.min(this.maxFreq, freq)));
    return ((logF - logMin) / (logMax - logMin)) * this.width;
  }

  private dbToY(db: number): number {
    const clamped = Math.max(-this.dbRange, Math.min(this.dbRange, db));
    return this.midY - (clamped / this.dbRange) * this.midY;
  }

  /**
   * Compute the composite EQ frequency response by summing individual
   * band gains at each frequency point. Uses a simplified bell/shelf
   * model — accurate enough for a visualisation, not for audio
   * processing.
   */
  private computeCurvePath(bands: TAiMasterPredictedParams['eq']): string {
    const points: string[] = [];
    for (let i = 0; i <= this.resolution; i++) {
      const ratio = i / this.resolution;
      const logFreq = Math.log10(this.minFreq) + ratio * (Math.log10(this.maxFreq) - Math.log10(this.minFreq));
      const freq = Math.pow(10, logFreq);
      const x = ratio * this.width;

      let totalGain = 0;
      for (const band of bands) {
        totalGain += this.bandGainAt(freq, band);
      }
      const y = this.dbToY(totalGain);
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  }

  /**
   * Approximate gain contribution of a single EQ band at a given
   * frequency. Uses a log-domain Gaussian bell for peaking bands and
   * a sigmoid shelf for low/high shelf bands.
   */
  private bandGainAt(
    freq: number,
    band: TAiMasterPredictedParams['eq'][number],
  ): number {
    const logF = Math.log10(freq);
    const logCenter = Math.log10(band.freq);
    const bw = 1 / Math.max(0.1, band.q); // bandwidth in octaves

    if (band.type === 'peaking') {
      // Gaussian bell in log-frequency domain
      const dist = (logF - logCenter) / (bw * 0.5);
      return band.gain * Math.exp(-0.5 * dist * dist);
    }

    if (band.type === 'low-shelf') {
      // Sigmoid: full gain below center, falls off above
      const dist = (logF - logCenter) / (bw * 0.3);
      return band.gain * (1 / (1 + Math.exp(dist * 3)));
    }

    if (band.type === 'high-shelf') {
      // Sigmoid: full gain above center, falls off below
      const dist = (logF - logCenter) / (bw * 0.3);
      return band.gain * (1 / (1 + Math.exp(-dist * 3)));
    }

    return 0;
  }
}
