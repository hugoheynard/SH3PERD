import { Component, computed, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { UserContextService } from '../../services/user-context.service';
import type { TPlatformRole } from '@sh3pherd/shared-types';

type PlanFeature = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  max: string | boolean;
};

const ARTIST_FEATURES: PlanFeature[] = [
  { label: 'Repertoire entries',   free: '50',        pro: 'Unlimited', max: 'Unlimited' },
  { label: 'Track uploads',        free: '50',        pro: 'Unlimited', max: 'Unlimited' },
  { label: 'Versions per track',   free: '2',         pro: '5',         max: 'Unlimited' },
  { label: 'Playlists',            free: '3',         pro: 'Unlimited', max: 'Unlimited' },
  { label: 'Search tabs',          free: '1',         pro: '10',        max: 'Unlimited' },
  { label: 'Tabs per search tab',  free: '3',         pro: '5',         max: 'Unlimited' },
  { label: 'Standard mastering',   free: '3/mo',      pro: 'Unlimited', max: 'Unlimited' },
  { label: 'AI mastering',         free: false,        pro: '10/mo',     max: '50/mo' },
  { label: 'Pitch shift',          free: '3/mo',      pro: 'Unlimited', max: 'Unlimited' },
  { label: 'Storage',              free: '500 MB',    pro: '5 GB',      max: '20 GB' },
  { label: 'Playlist → program',   free: false,        pro: true,        max: true },
  { label: 'Playlist sharing',     free: false,        pro: true,        max: true },
  { label: 'Cross-library (friends)', free: false,     pro: false,       max: true },
  { label: 'Persona match (AI)',   free: false,        pro: false,       max: true },
  { label: 'Rekordbox export',     free: false,        pro: true,        max: true },
];

const ARTIST_PLAN_META: { key: TPlatformRole; label: string; price: string; accent: string }[] = [
  { key: 'artist_free', label: 'Free', price: '0',     accent: 'var(--text-secondary)' },
  { key: 'artist_pro',  label: 'Pro',  price: '9.99',  accent: '#a78bfa' },
  { key: 'artist_max',  label: 'Max',  price: '19.99', accent: 'var(--accent-color)' },
];

const COMPANY_PLAN_META: { key: TPlatformRole; label: string; price: string; accent: string }[] = [
  { key: 'company_free',     label: 'Free',     price: '0',     accent: 'var(--text-secondary)' },
  { key: 'company_pro',      label: 'Pro',      price: '29.99', accent: '#a78bfa' },
  { key: 'company_business', label: 'Business', price: '79.99', accent: 'var(--accent-color)' },
];

@Component({
  selector: 'app-upgrade-panel',
  standalone: true,
  templateUrl: './upgrade-panel.component.html',
  styleUrl: './upgrade-panel.component.scss',
})
export class UpgradePanelComponent {
  private readonly layout = inject(LayoutService);
  private readonly userCtx = inject(UserContextService);

  readonly currentPlan = this.userCtx.plan;

  /** Resolve plan family from current plan prefix. */
  readonly isArtist = computed(() => {
    const plan = this.currentPlan();
    return !plan || plan.startsWith('artist_');
  });

  readonly plans = computed(() => this.isArtist() ? ARTIST_PLAN_META : COMPANY_PLAN_META);
  readonly features = ARTIST_FEATURES; // TODO: add COMPANY_FEATURES when needed

  readonly currentIndex = computed(() => {
    const plan = this.currentPlan();
    return this.plans().findIndex(p => p.key === plan);
  });

  close(): void {
    this.layout.clearRightPanel();
  }

  isCurrentPlan(planKey: string): boolean {
    return this.currentPlan() === planKey;
  }

  isBelowCurrent(planKey: string): boolean {
    const currentIdx = this.currentIndex();
    const idx = this.plans().findIndex(p => p.key === planKey);
    return idx < currentIdx;
  }

  cellValue(feature: PlanFeature, planKey: string): string | boolean {
    const col = planKey.replace(/^(artist|company)_/, '');
    return feature[col as keyof Pick<PlanFeature, 'free' | 'pro' | 'max'>];
  }
}
