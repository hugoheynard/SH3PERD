import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../contract.service';
import { ContractStore } from '../contract.store';
import { IconComponent } from '../../../shared/icon/icon.component';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import type {
  TAddendumId,
  TContractAddendumDomainModel,
  TContractDetailViewModel,
  TContractDocument,
  TContractDocumentId,
  TContractId,
  TContractRole,
  TContractStatus,
  TContractType,
  TCompensationPeriod,
  TWorkTimeType,
} from '@sh3pherd/shared-types';

type Section = 'position' | 'dates' | 'terms';
type AddendumTemplate =
  | 'change_remuneration'
  | 'extend_period'
  | 'extend_trial';

type EditForm = {
  status: TContractStatus;
  contract_type: TContractType | '';
  job_title: string;
  startDate: string;
  endDate: string;
  trial_period_days: string;
  compensation_amount: string;
  compensation_currency: string;
  compensation_period: TCompensationPeriod;
  work_time_type: TWorkTimeType;
  work_time_percentage: string;
};

type AddendumForm = {
  template: AddendumTemplate;
  effectiveDate: string;
  reason: string;
  comp_amount: string;
  comp_currency: string;
  comp_period: TCompensationPeriod;
  endDate: string;
  trial_days: string;
};

type SignatureStep = {
  key: 'draft' | 'user' | 'company' | 'active';
  label: string;
  date: Date | null;
  state: 'done' | 'current' | 'pending';
};

@Component({
  selector: 'app-contract-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IconComponent,
    AvatarComponent,
    ButtonComponent,
  ],
  templateUrl: './contract-detail-page.component.html',
  styleUrl: './contract-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contractService = inject(ContractService);
  private readonly store = inject(ContractStore);

  readonly detail = signal<TContractDetailViewModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // Per-section editing state
  readonly editing = signal<Section | null>(null);
  readonly saving = signal(false);
  readonly form = signal<EditForm>(this.defaultForm());

  // Role editor state
  readonly AVAILABLE_ROLES: TContractRole[] = [
    'owner',
    'admin',
    'rh',
    'artist',
    'viewer',
  ];
  readonly addingRole = signal(false);
  readonly selectedNewRole = signal<TContractRole>('viewer');

  // Document upload state
  readonly uploadingDoc = signal(false);
  readonly docUploadError = signal<string | null>(null);

  // Sign state
  readonly signing = signal(false);
  readonly signError = signal<string | null>(null);

  // Addendum state
  readonly showAddendumForm = signal(false);
  readonly creatingAddendum = signal(false);
  readonly addendumError = signal<string | null>(null);
  readonly signingAddendum = signal<TAddendumId | null>(null);
  readonly addendumForm = signal<AddendumForm>(this.defaultAddendumForm());
  readonly ADDENDUM_TEMPLATES: AddendumTemplate[] = [
    'change_remuneration',
    'extend_period',
    'extend_trial',
  ];

  // Status picker (rendered inside the hero)
  readonly editingStatus = signal(false);
  readonly STATUS_OPTIONS: TContractStatus[] = [
    'draft',
    'active',
    'terminated',
  ];
  readonly CONTRACT_TYPES: (TContractType | '')[] = [
    '',
    'CDI',
    'CDD',
    'freelance',
    'stage',
    'alternance',
  ];
  readonly PERIOD_OPTIONS: TCompensationPeriod[] = [
    'monthly',
    'daily',
    'hourly',
  ];
  readonly CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'];

  /** True when contract is active (locked for direct edits). */
  readonly isLocked = computed(() => this.detail()?.status === 'active');

  /** Signature stepper computed from current contract state. */
  readonly steps = computed<SignatureStep[]>(() => {
    const d = this.detail();
    if (!d) return [];
    const userSig = d.signatures?.user ?? null;
    const companySig = d.signatures?.company ?? null;

    const stepsList: SignatureStep[] = [
      { key: 'draft', label: 'Draft', date: null, state: 'done' },
      {
        key: 'user',
        label: 'Signed by employee',
        date: userSig?.signed_at ?? null,
        state: userSig ? 'done' : 'current',
      },
      {
        key: 'company',
        label: 'Countersigned',
        date: companySig?.signed_at ?? null,
        state: companySig ? 'done' : userSig ? 'current' : 'pending',
      },
      {
        key: 'active',
        label: 'Active',
        date: null,
        state: d.status === 'active' ? 'done' : 'pending',
      },
    ];
    // Only one "current" — mark everything after the first current as pending
    let seenCurrent = false;
    return stepsList.map((s) => {
      if (s.state === 'current' && seenCurrent)
        return { ...s, state: 'pending' as const };
      if (s.state === 'current') seenCurrent = true;
      return s;
    });
  });

  /** Progress bar width (%) based on how many steps are done. */
  readonly progressPercent = computed(() => {
    const s = this.steps();
    if (!s.length) return 0;
    const done = s.filter((x) => x.state === 'done').length;
    return Math.round(((done - 1) / (s.length - 1)) * 100);
  });

  private get contractId(): TContractId | null {
    return this.route.snapshot.paramMap.get('contractId') as TContractId | null;
  }

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    const id = this.contractId;
    if (!id) {
      this.error.set('Missing contract ID');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.contractService.getContractById(id).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load contract');
        this.loading.set(false);
      },
    });
  }

  // ── Section editing ──────────────────────────────────────

  startEdit(section: Section): void {
    const d = this.detail();
    if (!d) return;
    this.form.set({
      status: d.status,
      contract_type: d.contract_type ?? '',
      job_title: d.job_title ?? '',
      startDate: this.toInputDate(d.startDate),
      endDate: d.endDate ? this.toInputDate(d.endDate) : '',
      trial_period_days: d.trial_period_days?.toString() ?? '',
      compensation_amount: d.compensation?.amount.toString() ?? '',
      compensation_currency: d.compensation?.currency ?? 'EUR',
      compensation_period: d.compensation?.period ?? 'monthly',
      work_time_type: d.work_time?.type ?? 'full_time',
      work_time_percentage: d.work_time?.percentage?.toString() ?? '',
    });
    this.editing.set(section);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  patch(field: keyof EditForm, value: string): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  saveSection(section: Section): void {
    const id = this.contractId;
    if (!id) return;
    const f = this.form();
    this.saving.set(true);

    const dto: Record<string, unknown> = {};

    if (section === 'position') {
      dto['contract_type'] = f.contract_type || undefined;
      dto['job_title'] = f.job_title.trim() || undefined;
    }
    if (section === 'dates') {
      dto['startDate'] = f.startDate || undefined;
      dto['endDate'] = f.endDate || null;
      dto['trial_period_days'] = f.trial_period_days
        ? parseInt(f.trial_period_days, 10)
        : null;
    }
    if (section === 'terms') {
      dto['compensation'] = f.compensation_amount
        ? {
            amount: parseFloat(f.compensation_amount),
            currency: f.compensation_currency,
            period: f.compensation_period,
          }
        : null;
      dto['work_time'] = {
        type: f.work_time_type,
        percentage:
          f.work_time_type === 'part_time' && f.work_time_percentage
            ? parseInt(f.work_time_percentage, 10)
            : undefined,
      };
    }

    this.contractService.updateContract(id, dto as never).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.loadDetail();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to save changes');
      },
    });
  }

  // ── Status (inline in hero) ──────────────────────────────

  setStatus(status: TContractStatus): void {
    const id = this.contractId;
    const d = this.detail();
    if (!id || !d || d.status === status) {
      this.editingStatus.set(false);
      return;
    }
    this.saving.set(true);
    this.contractService.updateContract(id, { status } as never).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingStatus.set(false);
        this.loadDetail();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to change status');
      },
    });
  }

  // ── Roles ────────────────────────────────────────────────

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

  getAvailableRolesToAdd(): TContractRole[] {
    const current = this.detail()?.roles ?? [];
    return this.AVAILABLE_ROLES.filter((r) => !current.includes(r));
  }

  // ── Documents ────────────────────────────────────────────

  onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const id = this.contractId;
    if (!id) return;

    this.uploadingDoc.set(true);
    this.docUploadError.set(null);

    this.contractService.uploadDocument(id, file).subscribe({
      next: () => {
        this.uploadingDoc.set(false);
        input.value = '';
        this.loadDetail();
      },
      error: () => {
        this.uploadingDoc.set(false);
        this.docUploadError.set('Upload failed');
      },
    });
  }

  downloadDocument(doc: TContractDocument): void {
    const id = this.contractId;
    if (!id) return;
    this.contractService
      .getDocumentDownloadUrl(id, doc.id as TContractDocumentId)
      .subscribe({ next: ({ url }) => window.open(url, '_blank') });
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Signature ────────────────────────────────────────────

  sign(notify: boolean): void {
    const id = this.contractId;
    if (!id) return;
    this.signing.set(true);
    this.signError.set(null);
    this.contractService.signContract(id, notify).subscribe({
      next: () => {
        this.signing.set(false);
        this.loadDetail();
      },
      error: () => {
        this.signing.set(false);
        this.signError.set('Failed to sign contract');
      },
    });
  }

  // ── Addenda ──────────────────────────────────────────────

  patchAddendumForm(field: keyof AddendumForm, value: string): void {
    this.addendumForm.update((f) => ({ ...f, [field]: value }));
  }

  resetAddendumForm(): void {
    this.showAddendumForm.set(false);
    this.addendumForm.set(this.defaultAddendumForm());
    this.addendumError.set(null);
  }

  submitAddendum(): void {
    const id = this.contractId;
    if (!id) return;
    const f = this.addendumForm();
    this.creatingAddendum.set(true);
    this.addendumError.set(null);

    let changes: TContractAddendumDomainModel['changes'];
    if (f.template === 'change_remuneration') {
      changes = {
        template: 'change_remuneration',
        compensation: {
          amount: parseFloat(f.comp_amount),
          currency: f.comp_currency,
          period: f.comp_period,
        },
      };
    } else if (f.template === 'extend_period') {
      changes = { template: 'extend_period', endDate: new Date(f.endDate) };
    } else {
      changes = {
        template: 'extend_trial',
        trial_period_days: parseInt(f.trial_days, 10),
      };
    }

    this.contractService
      .createAddendum(id, {
        changes,
        effectiveDate: f.effectiveDate,
        reason: f.reason.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.creatingAddendum.set(false);
          this.resetAddendumForm();
          this.loadDetail();
        },
        error: () => {
          this.creatingAddendum.set(false);
          this.addendumError.set('Failed to create addendum');
        },
      });
  }

  signAddendum(addendum: TContractAddendumDomainModel): void {
    const id = this.contractId;
    if (!id) return;
    this.signingAddendum.set(addendum.id);
    this.contractService.signAddendum(id, addendum.id).subscribe({
      next: () => {
        this.signingAddendum.set(null);
        this.loadDetail();
      },
      error: () => {
        this.signingAddendum.set(null);
      },
    });
  }

  addendumLabel(template: AddendumTemplate): string {
    const labels: Record<AddendumTemplate, string> = {
      change_remuneration: 'Change compensation',
      extend_period: 'Extend period',
      extend_trial: 'Extend trial',
    };
    return labels[template];
  }

  // ── Formatters ───────────────────────────────────────────

  goBack(): void {
    const companyId = this.route.snapshot.parent?.parent?.paramMap.get('id');
    this.router.navigate(
      companyId ? ['/app/company', companyId] : ['/app/company'],
    );
  }

  fullName(d: TContractDetailViewModel): string {
    const parts = [d.user_first_name, d.user_last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : d.user_id;
  }

  formatCompensation(d: TContractDetailViewModel): string {
    if (!d.compensation) return '—';
    const { amount, currency, period } = d.compensation;
    const periodLabel: Record<string, string> = {
      monthly: '/ month',
      daily: '/ day',
      hourly: '/ hour',
    };
    return `${amount.toLocaleString()} ${currency} ${periodLabel[period as string] ?? ''}`;
  }

  formatWorkTime(d: TContractDetailViewModel): string {
    if (!d.work_time) return '—';
    if (d.work_time.type === 'full_time') return 'Full time';
    return `Part time${d.work_time.percentage ? ` — ${d.work_time.percentage}%` : ''}`;
  }

  private defaultForm(): EditForm {
    return {
      status: 'draft',
      contract_type: '',
      job_title: '',
      startDate: '',
      endDate: '',
      trial_period_days: '',
      compensation_amount: '',
      compensation_currency: 'EUR',
      compensation_period: 'monthly',
      work_time_type: 'full_time',
      work_time_percentage: '',
    };
  }

  private defaultAddendumForm(): AddendumForm {
    return {
      template: 'change_remuneration',
      effectiveDate: '',
      reason: '',
      comp_amount: '',
      comp_currency: 'EUR',
      comp_period: 'monthly',
      endDate: '',
      trial_days: '',
    };
  }

  private toInputDate(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    return date.toISOString().slice(0, 10);
  }
}
