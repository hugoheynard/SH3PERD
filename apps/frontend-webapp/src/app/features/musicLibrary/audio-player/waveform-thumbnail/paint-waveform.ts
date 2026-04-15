/** Options for {@link paintWaveform}. */
export interface PaintWaveformOptions {
  /** Colour of the bars. */
  readonly accentColor: string;
  /** Background colour. Pass `'transparent'` to skip the fill. */
  readonly bgColor: string;
}

/**
 * Paints a compact waveform on a `<canvas>` from a `Float32Array` of
 * normalised peaks. Pure function — it mutates the canvas but has no
 * other side effects and depends on nothing from Angular, which keeps
 * the core rendering logic unit-testable in isolation.
 *
 * Algorithm:
 * 1. Resize the backing store to `clientWidth/Height × devicePixelRatio`
 *    so bars render crisp on retina displays.
 * 2. Downsample peaks into `min(peaks.length, cssWidth)` buckets — one
 *    per rendered pixel column — keeping the max absolute amplitude.
 * 3. Draw each bucket as a vertical bar, mirrored around the centre
 *    (symmetric waveform), with a 0.5 px gap for legibility.
 */
export function paintWaveform(
  canvas: HTMLCanvasElement,
  peaks: Float32Array,
  options: PaintWaveformOptions,
): void {
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

  if (options.bgColor !== 'transparent') {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, cssW, cssH);
  }

  const barCount = Math.min(peaks.length, cssW);
  const barWidth = cssW / barCount;
  const bucketSize = peaks.length / barCount;
  const midY = cssH / 2;

  ctx.fillStyle = options.accentColor;

  for (let i = 0; i < barCount; i++) {
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
