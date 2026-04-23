import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiURLService } from './api-url.service';
import { ToastService } from '../../shared/toast/toast.service';
import { NotificationService } from '../notifications/notification.service';

type TUsageItem = {
  resource: string;
  current: number;
  limit: number;
  bonus: number;
  effective_limit: number;
  period: string;
};

type QuotaMeResponse = {
  data: {
    plan: string;
    usage: TUsageItem[];
  };
};

/**
 * Storage-quota warning — fires a toast + in-app notification when the user
 * crosses 80 % / 95 % of their `storage_bytes` allowance.
 *
 * Usage: call `check()` right after any mutation that consumes storage
 * (track upload, master, pitch-shift). The service hits `GET /quota/me`,
 * computes the ratio and fires exactly once per threshold per session —
 * we dedup on `(resource, threshold)` to avoid toast-spam on every
 * subsequent upload after the user passes 80 %.
 *
 * Thresholds chosen to mirror the tiered copy in the notification panel:
 * - 0.80 → warning: "approaching limit"
 * - 0.95 → error:   "almost out"
 * Crossing 1.0 isn't handled here; the backend's `QuotaExceededError`
 * surface takes over when the user actually tries to exceed the cap.
 */
@Injectable({ providedIn: 'root' })
export class StorageQuotaWarningService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(ApiURLService);
  private readonly toast = inject(ToastService);
  private readonly notifications = inject(NotificationService);

  private readonly fired = new Set<string>();

  /** Thresholds expressed as ratios of current / effective_limit. */
  private static readonly THRESHOLDS = [
    { ratio: 0.95, type: 'error' as const, title: 'Storage almost full' },
    {
      ratio: 0.8,
      type: 'warning' as const,
      title: 'Storage approaching limit',
    },
  ];

  /**
   * Fetch current quota state and surface warnings for `storage_bytes`.
   * Silent on HTTP failure — a quota check must never block a mutation.
   */
  check(): void {
    const quotaUrl = this.url.apiProtectedRoute('quota').build();
    this.http.get<QuotaMeResponse>(`${quotaUrl}/me`).subscribe({
      next: (res) => this.handleUsage(res.data.usage),
      error: () => {
        /* never throw — best-effort */
      },
    });
  }

  /** Direct entry point for code that already has a fresh usage list. */
  evaluate(usage: TUsageItem[]): void {
    this.handleUsage(usage);
  }

  /** Exposed for tests: drop the de-dup memory so a resource can fire again. */
  reset(): void {
    this.fired.clear();
  }

  private handleUsage(usage: TUsageItem[]): void {
    const storage = usage.find((u) => u.resource === 'storage_bytes');
    if (!storage) return;
    if (storage.effective_limit <= 0) return; // -1 (unlimited) or 0 (unavailable)

    const ratio = storage.current / storage.effective_limit;

    for (const t of StorageQuotaWarningService.THRESHOLDS) {
      if (ratio < t.ratio) continue;

      const key = `storage_bytes:${t.ratio}`;
      if (this.fired.has(key)) continue;
      this.fired.add(key);

      const pct = Math.round(ratio * 100);
      const message = `You have used ${pct} % of your audio storage quota.`;

      this.toast.show(`${t.title} — ${message}`, t.type);
      this.notifications.push({ type: t.type, title: t.title, message });

      return; // Only fire the highest-crossed threshold per call.
    }
  }
}
