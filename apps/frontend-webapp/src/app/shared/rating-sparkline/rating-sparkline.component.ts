import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * One point per track on a fixed 1–4 axis, joined by a line so the
 * user can see the rating shape across the playlist. Null entries
 * (track on this axis has no data — typically quality without an
 * analysis snapshot) are rendered as hollow dots and break the
 * connecting line so the absence is visible.
 *
 * The component draws a single SVG with a `viewBox` so the host sets
 * the size via CSS (width / height of the host). Keeps it trivial to
 * inline in tight card layouts or blow up in the detail view later.
 */
@Component({
  selector: 'app-rating-sparkline',
  standalone: true,
  templateUrl: './rating-sparkline.component.html',
  styleUrl: './rating-sparkline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingSparklineComponent {
  /** Per-track values in playlist order, 1–4 or null. */
  readonly series = input.required<(number | null)[]>();

  /**
   * Optional per-track durations in seconds, aligned with `series`.
   * When supplied with at least one non-zero entry, dots are placed
   * along X proportionally to the cumulative playtime so a 4-minute
   * track occupies roughly twice the horizontal room of a 2-minute
   * one. Falls back to uniform index-based spacing when absent,
   * empty, or all-zero so short/silent takes don't collapse onto
   * each other.
   */
  readonly durations = input<number[] | null>(null);

  /**
   * Optional semantic colour for the line + filled dots. Supply one of
   * the rating colour tokens (e.g. `var(--color-rating-high)`) or any
   * CSS colour. Defaults to the accent colour for backwards-compat.
   */
  readonly accent = input<string>('var(--accent-color, #818cf8)');

  /* ─── Geometry ─────────────────────────────────────────── */

  /** SVG coordinate space — wide enough for ~20 points to breathe. */
  readonly width = 80;
  readonly height = 22;
  private readonly paddingX = 3;
  private readonly paddingY = 3;

  /** Project `value ∈ [1..4]` onto the SVG Y axis (higher = smaller Y). */
  private y(value: number): number {
    const normalised = (value - 1) / 3; // 0..1
    const usable = this.height - this.paddingY * 2;
    return this.height - this.paddingY - normalised * usable;
  }

  /**
   * Per-track X coordinates. When `durations` resolves to a usable
   * timeline (length matches `series`, at least one positive value),
   * each dot sits at the *middle* of its track's time slice — matching
   * how a waveform would render the centre of a chunk — so the
   * horizontal position directly reflects when the track plays in the
   * set. Otherwise we fall back to evenly-spaced dots.
   *
   * Zero-duration entries (track with no analysed length and no
   * self-reported duration) are replaced with the mean of the positive
   * entries so they don't collapse onto their neighbour's cumulative
   * position — keeps the sparkline visually honest when only some
   * tracks have analysis data.
   */
  private readonly xs = computed<number[]>(() => {
    const count = this.series().length;
    if (count === 0) return [];
    if (count === 1) return [this.width / 2];

    const usable = this.width - this.paddingX * 2;
    const raw = this.durations();

    if (!raw || raw.length !== count) {
      return this.uniformXs(count, usable);
    }

    const positives = raw.filter((d) => d > 0);
    if (positives.length === 0) {
      return this.uniformXs(count, usable);
    }
    const meanPositive =
      positives.reduce((a, b) => a + b, 0) / positives.length;

    // Normalise: every entry contributes at least `meanPositive` to the
    // timeline so zero-duration tracks sit between their neighbours
    // instead of overlapping the previous cumulative point.
    const normalised = raw.map((d) => (d > 0 ? d : meanPositive));
    const total = normalised.reduce((a, b) => a + b, 0);

    const xs: number[] = [];
    let cumulative = 0;
    for (let i = 0; i < count; i++) {
      const slice = normalised[i];
      const centre = cumulative + slice / 2;
      xs.push(this.paddingX + (centre / total) * usable);
      cumulative += slice;
    }
    return xs;
  });

  private uniformXs(count: number, usable: number): number[] {
    return Array.from(
      { length: count },
      (_, i) => this.paddingX + (i / (count - 1)) * usable,
    );
  }

  /** Baseline Y — the area path closes down to this line. Matches the
   *  "rating 1" guide tick so the fill hugs the bottom of the chart. */
  private readonly baselineY = this.height - this.paddingY;

  /* ─── Resolved geometry signals ────────────────────────── */

  /** Per-track points with resolved `x` / `y` and null flag. */
  readonly points = computed(() => {
    const xs = this.xs();
    return this.series().map((v, i) => ({
      i,
      value: v,
      x: xs[i],
      y: v === null ? null : this.y(v),
    }));
  });

  /** Split the points into contiguous non-null runs so each run can
   *  be drawn with its own smooth path (and null gaps stay visible). */
  private readonly runs = computed((): { x: number; y: number }[][] => {
    const runs: { x: number; y: number }[][] = [];
    let current: { x: number; y: number }[] = [];
    for (const p of this.points()) {
      if (p.y === null) {
        if (current.length) runs.push(current);
        current = [];
      } else {
        current.push({ x: p.x, y: p.y });
      }
    }
    if (current.length) runs.push(current);
    return runs;
  });

  /**
   * Build a smoothed path through `pts` using Catmull-Rom→Bézier
   * conversion (tension = 1/6, the classic cardinal spline weight).
   * A run of length 1 falls back to a short horizontal tick so the
   * single data point is still legible.
   */
  private smoothPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return '';
    if (pts.length === 1) {
      const [p] = pts;
      return `M ${p.x - 2} ${p.y} L ${p.x + 2} ${p.y}`;
    }
    const fmt = (n: number) => n.toFixed(2);
    let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;

      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
    }
    return d;
  }

  /**
   * SVG `d` for the stroked line. Contiguous non-null runs are each
   * smoothed independently so a quality null gap renders as a visible
   * break rather than a straight line that lies about missing data.
   */
  readonly pathD = computed(() =>
    this.runs()
      .map((run) => this.smoothPath(run))
      .filter((s) => s.length > 0)
      .join(' '),
  );

  /**
   * SVG `d` for the filled area under the line. Single-point runs
   * (which stroke as a short tick) don't contribute — filling a
   * 4-pixel tick looks like noise. Multi-point runs close down to
   * `baselineY` and back up so the fill tracks the smoothed shape.
   */
  readonly areaD = computed(() => {
    const fmt = (n: number) => n.toFixed(2);
    return this.runs()
      .filter((r) => r.length >= 2)
      .map((run) => {
        const line = this.smoothPath(run);
        const last = run[run.length - 1];
        const first = run[0];
        return `${line} L ${fmt(last.x)} ${fmt(this.baselineY)} L ${fmt(first.x)} ${fmt(this.baselineY)} Z`;
      })
      .join(' ');
  });
}
