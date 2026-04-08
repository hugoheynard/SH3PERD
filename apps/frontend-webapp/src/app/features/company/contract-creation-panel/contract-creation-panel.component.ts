import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyStore } from '../company.store';
import { ContractStore } from '../contract.store';
import { UserLookupService } from '../user-lookup.service';
import type { TContractStatus, TUserSearchResult } from '@sh3pherd/shared-types';

type PanelStep = 'search' | 'new-user' | 'contract';

@Component({
  selector: 'app-contract-creation-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-creation-panel.component.html',
  styleUrl: './contract-creation-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractCreationPanelComponent {
  readonly store = inject(CompanyStore);
  private readonly contractStore = inject(ContractStore);
  private readonly userLookup = inject(UserLookupService);

  readonly closed = output<void>();
  readonly created = output<void>();

  // ── Step state ─────────────────────────────────────────────
  readonly step = signal<PanelStep>('search');

  // ── Step 1: search ─────────────────────────────────────────
  readonly searchEmail = signal('');
  readonly searching = signal(false);
  readonly searchResult = signal<TUserSearchResult | null | 'not-found'>('not-found');
  readonly selectedUser = signal<TUserSearchResult | null>(null);

  // ── Step 2: new user ───────────────────────────────────────
  readonly newFirstName = signal('');
  readonly newLastName = signal('');
  readonly inviting = signal(false);

  // ── Step 3: contract ───────────────────────────────────────
  readonly contractStatus = signal<TContractStatus>('draft');
  readonly contractStartDate = signal('');
  readonly contractEndDate = signal('');
  readonly submitting = signal(false);

  // ── Helpers ────────────────────────────────────────────────

  onEmailInput(e: Event): void {
    this.searchEmail.set((e.target as HTMLInputElement).value.trim());
    this.searchResult.set('not-found');
  }

  searchUser(): void {
    const email = this.searchEmail();
    if (!email) return;
    this.searching.set(true);
    this.userLookup.searchUserByEmail(email).subscribe({
      next: (res) => {
        this.searchResult.set(res.data ?? null);
        this.searching.set(false);
      },
      error: () => { this.searchResult.set(null); this.searching.set(false); },
    });
  }

  selectUser(user: TUserSearchResult): void {
    this.selectedUser.set(user);
    this.step.set('contract');
  }

  goToCreateUser(): void {
    this.step.set('new-user');
  }

  onFirstNameInput(e: Event): void { this.newFirstName.set((e.target as HTMLInputElement).value); }
  onLastNameInput(e: Event): void  { this.newLastName.set((e.target as HTMLInputElement).value); }

  inviteAndContinue(): void {
    this.inviting.set(true);
    this.userLookup.inviteUser({
      email: this.searchEmail(),
      first_name: this.newFirstName(),
      last_name: this.newLastName(),
    }).subscribe({
      next: (res) => {
        this.selectedUser.set(res.data);
        this.inviting.set(false);
        this.step.set('contract');
      },
      error: () => {
        this.inviting.set(false);
      },
    });
  }

  onStartDateInput(e: Event): void { this.contractStartDate.set((e.target as HTMLInputElement).value); }
  onEndDateInput(e: Event): void   { this.contractEndDate.set((e.target as HTMLInputElement).value); }
  setStatus(s: TContractStatus): void { this.contractStatus.set(s); }

  submitContract(): void {
    const company = this.store.company();
    const user = this.selectedUser();
    if (!company || !user || !this.contractStartDate()) return;

    this.submitting.set(true);
    this.contractStore.createContractForUser(
      company.id,
      user.user_id,
      {
        status: this.contractStatus(),
        startDate: this.contractStartDate(),
        endDate: this.contractEndDate() || undefined,
      },
      () => {
        this.submitting.set(false);
        this.created.emit();
      },
    );
  }

  getUserFullName(user: TUserSearchResult): string {
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
  }

  get hasSearchResult(): boolean {
    const r = this.searchResult();
    return r !== 'not-found' && r !== null;
  }

  get noResultFound(): boolean {
    return this.searchResult() === null;
  }
}
