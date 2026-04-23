import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  type OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ContractStore } from '../../contracts/services/contract.store';

/**
 * Home dashboard widget — surfaces the user's "current contract": the
 * one they've starred as `is_favorite` in their contract list.
 *
 * Data comes from the singleton {@link ContractStore}; the widget
 * triggers a lazy `loadMyContracts()` on mount so a freshly-opened
 * dashboard doesn't show a stale empty state. The store is
 * idempotent — reopening the widget in the same session is a no-op.
 *
 * States rendered:
 * - `loading` — store is fetching the list.
 * - `empty`   — list loaded, no contract flagged as favorite. The
 *               widget nudges the user to pick one from the contracts
 *               page.
 * - `ready`   — header + title + roles + dates + status badge.
 *
 * Clicking the widget deep-links to `/app/contracts` so the user can
 * change their pinned contract or inspect it further.
 */
@Component({
  selector: 'workspace-contract-widget',
  standalone: true,
  imports: [
    AvatarComponent,
    BadgeComponent,
    StatusBadgeComponent,
    IconComponent,
  ],
  templateUrl: './workspace-contract-widget.component.html',
  styleUrl: './workspace-contract-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceContractWidgetComponent implements OnInit {
  private readonly store = inject(ContractStore);
  private readonly router = inject(Router);

  readonly loading = this.store.loading;
  readonly contract = this.store.favoriteContract;

  /** Title shown on the card — job title > contract type > fallback. */
  readonly title = computed(() => {
    const c = this.contract();
    if (!c) return '';
    return c.job_title ?? c.contract_type ?? 'Contract';
  });

  /** Only keep the two most relevant roles on a small card. */
  readonly primaryRoles = computed(
    () => this.contract()?.roles.slice(0, 2) ?? [],
  );

  readonly extraRoleCount = computed(() => {
    const all = this.contract()?.roles.length ?? 0;
    return Math.max(0, all - this.primaryRoles().length);
  });

  readonly dateRange = computed(() => {
    const c = this.contract();
    if (!c) return '';
    const start = formatShort(c.startDate);
    if (!c.endDate) return `${start} → ongoing`;
    return `${start} → ${formatShort(c.endDate)}`;
  });

  ngOnInit(): void {
    // Idempotent — the store short-circuits on subsequent calls.
    this.store.loadMyContracts();
  }

  open(): void {
    void this.router.navigateByUrl('/app/contracts');
  }
}

function formatShort(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
