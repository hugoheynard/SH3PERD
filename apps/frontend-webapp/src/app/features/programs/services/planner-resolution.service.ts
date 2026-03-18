import { Injectable, signal } from '@angular/core';


/**
 * Provides the core mathematical conversions used by the planner timeline.
 *
 * This service acts as the **resolution engine** of the timeline,
 * responsible for translating between:
 *
 * - **Time (minutes)** → logical domain
 * - **Pixels (px)** → visual domain
 *
 * It also centralizes the **snapping logic**, ensuring that all timeline
 * interactions (drag, resize, insert, etc.) align consistently with
 * the configured grid resolution.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE IN ARCHITECTURE
 * ---------------------------------------------------------------------------
 *
 * Part of the **Math / Resolution layer**.
 *
 * This service is:
 * - Pure (no DOM access)
 * - Stateless (except for reactive configuration via signals)
 * - Shared across spatial and interaction systems
 *
 * It must remain **independent from UI concerns** such as:
 * - grid offsets
 * - DOM positioning
 * - layout calculations
 *
 * ---------------------------------------------------------------------------
 * ⚡ RESPONSIBILITIES
 * ---------------------------------------------------------------------------
 *
 * - Convert minutes → pixels (for rendering)
 * - Convert pixels → minutes (for pointer interactions)
 * - Apply snapping to timeline values
 *
 * ---------------------------------------------------------------------------
 * 🎯 USAGE
 * ---------------------------------------------------------------------------
 *
 * Used by:
 *
 * - `TimelineSpatialService` → pointer projection
 * - `TimelineInteractionService` → drag & resize
 * - UI components → positioning elements (slots, insert line)
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Always snap **after converting px → minutes**
 * - Never mix this service with visual offsets (grid, headers, etc.)
 * - This service defines the **single source of truth** for timeline scale
 *
 * ---------------------------------------------------------------------------
 * 💡 EXAMPLE
 * ---------------------------------------------------------------------------
 *
 * ```ts
 * const minutes = res.pxToMinutes(pointerY);
 * const snapped = res.snap(minutes);
 * const top = res.minuteToPx(snapped);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PlannerResolutionService {

  /**
   * Defines how many pixels represent one minute in the timeline.
   *
   * Increasing this value zooms in vertically,
   * decreasing it zooms out.
   *
   * Example:
   * - 5 → 1 minute = 5px
   * - 60 → 1 hour = 300px
   */
  pixelsPerMinute = signal(5);

  /**
   * Defines the snapping interval in minutes.
   *
   * All timeline interactions (drag, resize, insert)
   * will align to multiples of this value.
   *
   * Example:
   * - 5 → snap every 5 minutes
   * - 15 → snap every quarter-hour
   */
  snapMinutes = signal(5);

  /**
   * Converts a duration in minutes to pixels.
   *
   * @param minutes - Time value in minutes
   * @returns Corresponding value in pixels
   */
  minuteToPx(minutes: number): number {
    return minutes * this.pixelsPerMinute();
  }

  /**
   * Converts a pixel value to minutes.
   *
   * Used to translate pointer positions into timeline time.
   *
   * @param px - Pixel value
   * @returns Corresponding time in minutes
   */
  pxToMinutes(px: number): number {
    return px / this.pixelsPerMinute();
  }

  /**
   * Applies snapping to a time value.
   *
   * Rounds the given minutes to the nearest multiple
   * of the configured snapping interval.
   *
   * @param minutes - Raw time value in minutes
   * @returns Snapped time value
   */
  snap(minutes: number): number {
    const step = this.snapMinutes();
    return Math.round(minutes / step) * step;
  }
}
