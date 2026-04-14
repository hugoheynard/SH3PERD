import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { ApiURLService } from '../../../../../core/services/api-url.service';
import { getPlanPrice } from '@sh3pherd/shared-types';

export type TUsageItem = {
  resource: string;
  current: number;
  limit: number;
  period: 'monthly' | 'lifetime';
};

/** Human-readable labels for quota resources. */
const RESOURCE_LABELS: Record<string, string> = {
  repertoire_entry:  'Songs in library',
  track_upload:      'Track uploads',
  track_version:     'Versions per track',
  playlist:          'Playlists',
  search_tab:        'Search tabs',
  search_tab_items:  'Tabs per search tab',
  master_standard:   'Standard mastering',
  master_ai:         'AI mastering',
  pitch_shift:       'Pitch shift',
  storage_bytes:     'Storage',
};

/** Plan display labels. */
const PLAN_LABELS: Record<string, string> = {
  artist_free: 'Artist Free',
  artist_pro: 'Artist Pro',
  artist_max: 'Artist Max',
  company_free: 'Company Free',
  company_pro: 'Company Pro',
  company_business: 'Company Business',
};

@Component({
  selector: 'sh3-plan-usage',
  standalone: true,
  imports: [],
  templateUrl: './plan-usage.component.html',
  styleUrl: './plan-usage.component.scss',
})
export class PlanUsageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly userCtx = inject(UserContextService);
  private readonly url = inject(ApiURLService);

  private readonly quotaURL = this.url.apiProtectedRoute('quota').build();

  readonly plan = this.userCtx.plan;
  readonly usage = signal<TUsageItem[]>([]);
  readonly loading = signal(true);

  readonly planLabel = computed(() => {
    const p = this.plan();
    return p ? PLAN_LABELS[p] ?? p : '';
  });

  readonly planPrice = computed(() => {
    const p = this.plan();
    return p ? getPlanPrice(p, 'annual') : 0;
  });

  ngOnInit(): void {
    this.http.get<{ data: TUsageItem[] }>(`${this.quotaURL}/me`).subscribe({
      next: (res) => {
        this.usage.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Get a human-readable label for a resource. */
  resourceLabel(resource: string): string {
    return RESOURCE_LABELS[resource] ?? resource;
  }

  /** Format limit: -1 → "Unlimited", 0 → "Not available". */
  formatLimit(item: TUsageItem): string {
    if (item.limit === -1) return 'Unlimited';
    if (item.limit === 0) return 'Not available';
    if (item.resource === 'storage_bytes') return this.formatBytes(item.limit);
    return `${item.limit}`;
  }

  /** Format current value, with special handling for storage. */
  formatCurrent(item: TUsageItem): string {
    if (item.resource === 'storage_bytes') return this.formatBytes(item.current);
    return `${item.current}`;
  }

  /** Usage ratio 0–100 for progress bar. */
  usagePercent(item: TUsageItem): number {
    if (item.limit <= 0) return 0;
    return Math.min(100, Math.round((item.current / item.limit) * 100));
  }

  /** True when usage is ≥ 80% of limit. */
  isNearLimit(item: TUsageItem): boolean {
    if (item.limit <= 0) return false;
    return (item.current / item.limit) >= 0.8;
  }

  /** True when usage has reached the limit. */
  isAtLimit(item: TUsageItem): boolean {
    if (item.limit <= 0) return false;
    return item.current >= item.limit;
  }

  /** Period label. */
  periodLabel(item: TUsageItem): string {
    return item.period === 'monthly' ? 'this month' : '';
  }

  private formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  }
}
