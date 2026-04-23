import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  DASHBOARD_LAYOUT_VERSION,
  SDashboardLayout,
  type TDashboardLayout,
} from '@sh3pherd/shared-types';

/**
 * Persistence port for the home dashboard layout.
 *
 * Responsibilities — narrow on purpose:
 * - Hydrate a `TDashboardLayout` from local storage (SSR-safe).
 * - Persist a `TDashboardLayout` back, running it through the Zod
 *   schema so malformed blobs never reach disk.
 *
 * Intentionally not responsible:
 * - Holding live state. The grid component owns the runtime
 *   `WidgetItem[]` so Gridster can mutate in place. This store is a
 *   read/write adapter only; swap it for a CQRS-backed implementation
 *   later without touching the grid.
 * - Reconciling catalog drift. If a persisted `defId` is removed from
 *   the frontend catalog, the schema still accepts it but the grid
 *   silently skips it (no component to mount).
 */
@Injectable({ providedIn: 'root' })
export class DashboardLayoutStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private static readonly STORAGE_KEY = 'sh3pherd.home.dashboardLayout';

  /**
   * Loads the persisted layout, or `null` when nothing is stored or
   * the blob is corrupt / not for this version. Callers fall back to
   * whatever default layout they ship.
   */
  loadLayout(): TDashboardLayout | null {
    if (!this.isBrowser) return null;
    let raw: string | null;
    try {
      raw = localStorage.getItem(DashboardLayoutStore.STORAGE_KEY);
    } catch {
      return null;
    }
    if (!raw) return null;

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return null;
    }

    const parsed = SDashboardLayout.safeParse(json);
    if (!parsed.success) return null;

    // Version mismatch — drop the blob instead of guessing a migration.
    // When a migration is needed, route old versions through a dedicated
    // `migrate(prev)` helper before returning.
    if (parsed.data.version !== DASHBOARD_LAYOUT_VERSION) return null;

    return parsed.data;
  }

  /**
   * Validates, serialises and writes the layout. Silently swallows
   * quota / unavailability errors — a dashboard is a convenience,
   * losing one persistence round isn't worth a user-facing toast.
   */
  saveLayout(layout: TDashboardLayout): void {
    if (!this.isBrowser) return;
    const parsed = SDashboardLayout.safeParse(layout);
    if (!parsed.success) return;
    try {
      localStorage.setItem(
        DashboardLayoutStore.STORAGE_KEY,
        JSON.stringify(parsed.data),
      );
    } catch {
      // Quota / private-mode — nothing we can do here.
    }
  }

  /** Wipes the persisted layout. Used by dev tools / reset actions. */
  clear(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(DashboardLayoutStore.STORAGE_KEY);
    } catch {
      // same as saveLayout — noop on failure
    }
  }
}
