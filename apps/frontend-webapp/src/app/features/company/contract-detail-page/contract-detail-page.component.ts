import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../contract.service';
import { ContractStore } from '../contract.store';
import type {
  TContractDetailViewModel,
  TContractId,
  TContractRole,
  TContractStatus,
  TContractType,
  TCompensationPeriod,
  TWorkTimeType,
} from '@sh3pherd/shared-types';

type EditForm = {
  status:             TContractStatus;
  contract_type:      TContractType | '';
  job_title:          string;
  startDate:          string;
  endDate:            string;
  trial_period_days:  string;
  compensation_amount:   string;
  compensation_currency: string;
  compensation_period:   TCompensationPeriod;
  work_time_type:        TWorkTimeType;
  work_time_percentage:  string;
};

@Component({
  selector: 'app-contract-detail-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './contract-detail-page.component.html',
  styleUrl: './contract-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractDetailPageComponent implements OnInit {
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly contractService = inject(ContractService);
  private readonly store           = inject(ContractStore);

  readonly detail  = signal<TContractDetailViewModel | null>(null);
  readonly loading = signal(true);
  readonly error   = signal<string | null>(null);
  readonly editing = signal(false);
  readonly saving  = signal(false);
  readonly form    = signal<EditForm>(this.defaultForm());

  readonly AVAILABLE_ROLES: TContractRole[] = ['owner', 'admin', 'artist', 'viewer'];
  readonly addingRole = signal(false);
  readonly selectedNewRole = signal<TContractRole>('viewer');

  readonly STATUS_OPTIONS: TContractStatus[]      = ['draft', 'active', 'terminated'];
  readonly CONTRACT_TYPES: (TContractType | '')[] = ['', 'CDI', 'CDD', 'freelance', 'stage', 'alternance'];
  readonly PERIOD_OPTIONS: TCompensationPeriod[]  = ['monthly', 'daily', 'hourly'];
  readonly CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

  private get contractId(): TContractId | null {
    return this.route.snapshot.paramMap.get('contractId') as TContractId | null;
  }

  ngOnInit(): void { this.loadDetail(); }

  loadDetail(): void {
    const id = this.contractId;
    if (!id) { this.error.set('Missing contract ID'); this.loading.set(false); return; }
    this.loading.set(true);
    this.error.set(null);
    this.contractService.getContractById(id).subscribe({
      next:  (data) => { this.detail.set(data); this.loading.set(false); },
      error: ()     => { this.error.set('Failed to load contract'); this.loading.set(false); },
    });
  }

  startEdit(): void {
    const d = this.detail();
    if (!d) return;
    this.form.set({
      status:                d.status,
      contract_type:         d.contract_type ?? '',
      job_title:             d.job_title ?? '',
      startDate:             this.toInputDate(d.startDate),
      endDate:               d.endDate ? this.toInputDate(d.endDate) : '',
      trial_period_days:     d.trial_period_days?.toString() ?? '',
      compensation_amount:   d.compensation?.amount.toString() ?? '',
      compensation_currency: d.compensation?.currency ?? 'EUR',
      compensation_period:   d.compensation?.period ?? 'monthly',
      work_time_type:        d.work_time?.type ?? 'full_time',
      work_time_percentage:  d.work_time?.percentage?.toString() ?? '',
    });
    this.editing.set(true);
  }

  cancelEdit(): void { this.editing.set(false); }

  patch(field: keyof EditForm, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  saveEdit(): void {
    const id = this.contractId;
    if (!id) return;
    const f = this.form();
    this.saving.set(true);

    const dto: Record<string, unknown> = {
      status:        f.status,
      contract_type: f.contract_type || undefined,
      job_title:     f.job_title.trim() || undefined,
      startDate:     f.startDate || undefined,
      endDate:       f.endDate || null,
      trial_period_days: f.trial_period_days ? parseInt(f.trial_period_days, 10) : null,
    };

    if (f.compensation_amount) {
      dto['compensation'] = {
        amount:   parseFloat(f.compensation_amount),
        currency: f.compensation_currency,
        period:   f.compensation_period,
      };
    } else {
      dto['compensation'] = null;
    }

    if (f.work_time_type) {
      dto['work_time'] = {
        type: f.work_time_type,
        percentage: f.work_time_type === 'part_time' && f.work_time_percentage
          ? parseInt(f.work_time_percentage, 10)
          : undefined,
      };
    }

    this.contractService.updateContract(id, dto as any).subscribe({
      next: () => { this.saving.set(false); this.editing.set(false); this.loadDetail(); },
      error: () => { this.saving.set(false); this.error.set('Failed to save changes'); },
    });
  }

  // ── Role management ─────────────────────────────────────

  assignRole(): void {
    const id = this.contractId;
    if (!id) return;
    this.store.assignContractRole(id, this.selectedNewRole(), () => {
      this.addingRole.set(false);
      this.loadDetail();
    });
  }

  removeRole(role: TContractRole): void {
    const id = this.contractId;
    if (!id) return;
    this.store.removeContractRole(id, role, () => this.loadDetail());
  }

  getRoleColor(role: TContractRole): string {
    const map: Record<TContractRole, string> = { owner: '#f6ad55', admin: '#b794f4', artist: '#63b3ed', viewer: '#68d391' };
    return map[role] ?? '#a0aec0';
  }

  getAvailableRolesToAdd(): TContractRole[] {
    const current = this.detail()?.roles ?? [];
    return this.AVAILABLE_ROLES.filter(r => !current.includes(r));
  }

  goBack(): void {
    const companyId = this.route.snapshot.parent?.parent?.paramMap.get('id');
    this.router.navigate(companyId ? ['/app/company', companyId] : ['/app/company']);
  }

  fullName(d: TContractDetailViewModel): string {
    const parts = [d.user_first_name, d.user_last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : d.user_id;
  }

  initials(d: TContractDetailViewModel): string {
    return ((d.user_first_name?.[0] ?? '') + (d.user_last_name?.[0] ?? '')).toUpperCase() || '?';
  }

  formatCompensation(d: TContractDetailViewModel): string {
    if (!d.compensation) return '—';
    const { amount, currency, period } = d.compensation;
    const periodLabel: Record<string, string> = {
      monthly: '/ month',
      daily:   '/ day',
      hourly:  '/ hour',
    };
    return `${amount.toLocaleString()} ${currency} ${periodLabel[period as string] ?? ''}`;
  }

  formatWorkTime(d: TContractDetailViewModel): string {
    if (!d.work_time) return '—';
    if (d.work_time.type === 'full_time') return 'Full time';
    return `Part time${d.work_time.percentage ? ' — ' + d.work_time.percentage + '%' : ''}`;
  }

  private defaultForm(): EditForm {
    return {
      status: 'draft', contract_type: '', job_title: '',
      startDate: '', endDate: '', trial_period_days: '',
      compensation_amount: '', compensation_currency: 'EUR', compensation_period: 'monthly',
      work_time_type: 'full_time', work_time_percentage: '',
    };
  }

  private toInputDate(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    return date.toISOString().slice(0, 10);
  }
}
