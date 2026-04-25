import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import type {
  TAddendumId,
  TAddendumTemplate,
  TContractAddendumDomainModel,
  TContractDetailViewModel,
  TContractDocument,
  TContractDocumentId,
  TContractId,
} from '@sh3pherd/shared-types';
import { ContractsService } from '../../services/contracts.service';
import { UserContextService } from '../../../../core/services/user-context.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { SignatureStepperComponent } from '../shared/signature-stepper/signature-stepper.component';

@Component({
  selector: 'app-artist-contract-detail-page',
  standalone: true,
  imports: [
    DatePipe,
    IconComponent,
    ButtonComponent,
    SignatureStepperComponent,
  ],
  templateUrl: './contract-detail-page.component.html',
  styleUrl: './contract-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contractsService = inject(ContractsService);
  private readonly userCtx = inject(UserContextService);
  private readonly toast = inject(ToastService);

  readonly detail = signal<TContractDetailViewModel | null>(null);
  readonly addenda = signal<TContractAddendumDomainModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly signing = signal(false);
  readonly signError = signal<string | null>(null);
  readonly signingDocument = signal<TContractDocumentId | null>(null);
  readonly signingAddendum = signal<TAddendumId | null>(null);

  /** Whether the recipient (user side) has already signed the contract. */
  readonly hasUserSigned = computed(() => !!this.detail()?.signatures?.user);

  /** Sign action visible only when contract is still draft and user hasn't signed. */
  readonly canSignContract = computed(() => {
    const d = this.detail();
    return !!d && d.status === 'draft' && !this.hasUserSigned();
  });

  /** True when this contract is the user's currently-active workspace. */
  readonly isActiveWorkspace = computed(
    () => this.userCtx.currentContractId() === this.contractId,
  );

  private get contractId(): TContractId | null {
    return this.route.snapshot.paramMap.get('contractId') as TContractId | null;
  }

  ngOnInit(): void {
    const id = this.contractId;
    if (!id) {
      this.error.set('Missing contract ID');
      this.loading.set(false);
      return;
    }
    // Read the contract via an explicit X-Contract-Id header (see
    // ContractsService) — viewing must not silently switch the user's
    // persisted workspace. The user opts in via the "Activate this
    // contract" button.
    this.loadDetail();
  }

  /** Promote this contract to the user's active workspace (persists to prefs). */
  activateAsWorkspace(): void {
    const id = this.contractId;
    if (!id) return;
    this.userCtx.setWorkspace(id);
    this.toast.show('Contract activated as your workspace', 'success');
  }

  loadDetail(): void {
    const id = this.contractId;
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.contractsService.getContractById(id).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.addenda.set(data.addenda ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load contract');
        this.loading.set(false);
      },
    });
  }

  // ── Signing ──────────────────────────────────────────────

  sign(notify: boolean): void {
    const id = this.contractId;
    if (!id) return;
    this.signing.set(true);
    this.signError.set(null);
    this.contractsService.signContract(id, notify).subscribe({
      next: () => {
        this.signing.set(false);
        this.toast.show('Contract signed', 'success');
        this.loadDetail();
      },
      error: () => {
        this.signing.set(false);
        this.signError.set('Failed to sign contract');
        this.toast.show('Failed to sign contract', 'error');
      },
    });
  }

  signDocument(documentId: TContractDocumentId): void {
    const id = this.contractId;
    if (!id) return;
    this.signingDocument.set(documentId);
    this.contractsService.signDocument(id, documentId).subscribe({
      next: () => {
        this.signingDocument.set(null);
        this.toast.show('Document signed', 'success');
        this.loadDetail();
      },
      error: () => {
        this.signingDocument.set(null);
        this.toast.show('Failed to sign document', 'error');
      },
    });
  }

  signAddendum(addendum: TContractAddendumDomainModel): void {
    const id = this.contractId;
    if (!id) return;
    this.signingAddendum.set(addendum.id);
    this.contractsService.signAddendum(id, addendum.id).subscribe({
      next: () => {
        this.signingAddendum.set(null);
        this.toast.show('Addendum signed', 'success');
        this.loadDetail();
      },
      error: () => {
        this.signingAddendum.set(null);
        this.toast.show('Failed to sign addendum', 'error');
      },
    });
  }

  downloadDocument(doc: TContractDocument): void {
    const id = this.contractId;
    if (!id) return;
    this.contractsService
      .getDocumentDownloadUrl(id, doc.id as TContractDocumentId)
      .subscribe({ next: ({ url }) => window.open(url, '_blank') });
  }

  // ── Document signing eligibility ─────────────────────────

  canSignDocument(doc: TContractDocument): boolean {
    return !!doc.requiresSignature && !doc.signatures?.user;
  }

  isDocumentFullySigned(doc: TContractDocument): boolean {
    return !!doc.signatures?.user && !!doc.signatures?.company;
  }

  canSignAddendum(addendum: TContractAddendumDomainModel): boolean {
    return addendum.status === 'draft' && !addendum.signatures?.user;
  }

  // ── Formatters / navigation ──────────────────────────────

  goBack(): void {
    this.router.navigate(['/app/contracts']);
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  addendumLabel(template: TAddendumTemplate): string {
    const labels: Record<TAddendumTemplate, string> = {
      change_remuneration: 'Change compensation',
      extend_period: 'Extend period',
      extend_trial: 'Extend trial',
    };
    return labels[template];
  }
}
