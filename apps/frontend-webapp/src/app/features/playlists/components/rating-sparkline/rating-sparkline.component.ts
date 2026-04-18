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

  /** X coordinate for the `i`-th track. Single-track playlists pin
   *  the dot to the middle so the graph reads as "one data point". */
  private x(i: number, count: number): number {
    if (count <= 1) return this.width / 2;
    const usable = this.width - this.paddingX * 2;
    return this.paddingX + (i / (count - 1)) * usable;
  }

  /* ─── Resolved geometry signals ────────────────────────── */

  /** Per-track points with resolved `x` / `y` and null flag. */
  readonly points = computed(() =>
    this.series().map((v, i) => ({
      i,
      value: v,
      x: this.x(i, this.series().length),
      y: v === null ? null : this.y(v),
    })),
  );

  /**
   * SVG `path` `d` attribute. Contiguous non-null runs are joined
   * into a single sub-path; null entries break the line so the gap
   * is visible. Runs of length 1 draw a short horizontal tick so a
   * single data point is still legible.
   */
  readonly pathD = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';

    const segments: string[] = [];
    let run: { x: number; y: number }[] = [];

    const flush = () => {
      if (run.length === 0) return;
      if (run.length === 1) {
        // Tiny horizontal tick so a single-run dot has a visible line.
        const [p] = run;
        segments.push(`M ${p.x - 2} ${p.y} L ${p.x + 2} ${p.y}`);
      } else {
        segments.push(
          'M ' +
            run.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L '),
        );
      }
      run = [];
    };

    for (const p of pts) {
      if (p.y === null) {
        flush();
      } else {
        run.push({ x: p.x, y: p.y });
      }
    }
    flush();
    return segments.join(' ');
  });
}
