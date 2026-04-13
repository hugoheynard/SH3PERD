import { Component, computed, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { UserContextService } from '../../services/user-context.service';
import type { TPlatformRole } from '@sh3pherd/shared-types';

type PlanFeature = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  band: string | boolean;
  business: string | boolean;
};

const PLAN_FEATURES: PlanFeature[] = [
  { label: 'Repertoire entries',   free: '50',        pro: 'Unlimited', band: 'Unlimited', business: 'Unlimited' },
  { label: 'Track uploads',        free: '50',        pro: 'Unlimited', band: 'Unlimited', business: 'Unlimited' },
  { label: 'Standard mastering',   free: '3/mo',      pro: 'Unlimited', band: 'Unlimited', business: 'Unlimited' },
  { label: 'AI mastering',         free: false,        pro: '10/mo',     band: 'Unlimited', business: 'Unlimited' },
  { label: 'Pitch shift',          free: '3/mo',      pro: 'Unlimited', band: 'Unlimited', business: 'Unlimited' },
  { label: 'Storage',              free: '500 MB',    pro: '5 GB',      band: '20 GB',     business: '100 GB' },
  { label: 'Playlists',            free: 'Read only', pro: 'Full',      band: 'Full',      business: 'Full' },
  { label: 'Setlists',             free: false,        pro: true,        band: true,        business: true },
  { label: 'Cross library',        free: false,        pro: false,       band: true,        business: true },
  { label: 'Persona match (AI)',   free: false,        pro: false,       band: true,        business: true },
  { label: 'Event programming',    free: false,        pro: false,       band: false,       business: true },
];

const PLAN_META: { key: TPlatformRole; label: string; price: string; accent: string }[] = [
  { key: 'plan_free',     label: 'Free',     price: '0',   accent: 'var(--text-secondary)' },
  { key: 'plan_pro',      label: 'Pro',      price: '9',   accent: '#a78bfa' },
  { key: 'plan_band',     label: 'Band',     price: '29',  accent: '#22d3ee' },
  { key: 'plan_business', label: 'Business', price: '79',  accent: '#fbbf24' },
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
  readonly plans = PLAN_META;
  readonly features = PLAN_FEATURES;

  readonly currentIndex = computed(() => {
    const plan = this.currentPlan();
    return PLAN_META.findIndex(p => p.key === plan);
  });

  close(): void {
    this.layout.clearRightPanel();
  }

  isCurrentPlan(planKey: string): boolean {
    return this.currentPlan() === planKey;
  }

  isBelowCurrent(planKey: string): boolean {
    const currentIdx = this.currentIndex();
    const idx = PLAN_META.findIndex(p => p.key === planKey);
    return idx < currentIdx;
  }

  cellValue(feature: PlanFeature, planKey: string): string | boolean {
    return feature[planKey as keyof Pick<PlanFeature, 'free' | 'pro' | 'band' | 'business'>];
  }
}
