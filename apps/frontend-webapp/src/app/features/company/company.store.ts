import { inject, Injectable, signal, computed } from '@angular/core';
import { CompanyService } from './company.service';
import type {
  TCompanyAddress,
  TCompanyContractViewModel,
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TTeamRecord,
  TCompanyId,
  TCompanyAdminRole,
  TContractStatusEnum,
  TServiceId,
  TUserId,
} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root',
})
export class CompanyStore {
  private readonly companyService = inject(CompanyService);

  // ── State ──────────────────────────────────────────────────
  private readonly _company = signal<TCompanyDetailViewModel | null>(null);
  private readonly _companies = signal<TCompanyCardViewModel[]>([]);
  private readonly _teams = signal<TTeamRecord[]>([]);
  private readonly _contracts = signal<TCompanyContractViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors ──────────────────────────────────────────────
  readonly company = this._company.asReadonly();
  readonly companies = this._companies.asReadonly();
  readonly teams = this._teams.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasCompany = computed(() => this._company() !== null);
  readonly services = computed(() => this._company()?.services ?? []);
  readonly admins = computed(() => this._company()?.admins ?? []);
  readonly contracts = this._contracts.asReadonly();

  // ── Actions ────────────────────────────────────────────────

  createCompany(name: string): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.createCompany(name).subscribe({
      next: (res) => {
        this._company.set(res.data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[CompanyStore] createCompany failed', err);
        this._error.set('Failed to create company.');
        this._loading.set(false);
      },
    });
  }

  loadMyCompany(): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getMyCompany().subscribe({
      next: (res) => {
        this._company.set(res.data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[CompanyStore] loadMyCompany failed', err);
        this._error.set('Failed to load company.');
        this._loading.set(false);
      },
    });
  }

  loadMyCompanies(): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getMyCompanies().subscribe({
      next: (res) => {
        this._companies.set(res.data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[CompanyStore] loadMyCompanies failed', err);
        this._error.set('Failed to load companies.');
        this._loading.set(false);
      },
    });
  }

  loadCompanyById(id: TCompanyId): void {
    this._loading.set(true);
    this._error.set(null);
    this.companyService.getCompanyById(id).subscribe({
      next: (res) => {
        this._company.set(res.data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('[CompanyStore] loadCompanyById failed', err);
        this._error.set('Failed to load company.');
        this._loading.set(false);
      },
    });
  }

  updateCompanyInfo(id: TCompanyId, dto: { name?: string; description?: string; address?: TCompanyAddress }): void {
    this._loading.set(true);
    this.companyService.updateCompanyInfo(id, dto).subscribe({
      next: (res) => { this._company.set(res.data); this._loading.set(false); },
      error: (err) => { console.error('[CompanyStore] updateCompanyInfo failed', err); this._loading.set(false); },
    });
  }

  addAdmin(id: TCompanyId, userId: TUserId, role: TCompanyAdminRole): void {
    this.companyService.addAdmin(id, userId, role).subscribe({
      next: (res) => this._company.set(res.data),
      error: (err) => console.error('[CompanyStore] addAdmin failed', err),
    });
  }

  removeAdmin(id: TCompanyId, userId: TUserId): void {
    this.companyService.removeAdmin(id, userId).subscribe({
      next: (res) => this._company.set(res.data),
      error: (err) => console.error('[CompanyStore] removeAdmin failed', err),
    });
  }

  deleteCompany(id: TCompanyId, onSuccess: () => void): void {
    this._loading.set(true);
    this.companyService.deleteCompany(id).subscribe({
      next: () => {
        this._company.set(null);
        this._loading.set(false);
        onSuccess();
      },
      error: (err) => {
        console.error('[CompanyStore] deleteCompany failed', err);
        this._error.set('Failed to delete company.');
        this._loading.set(false);
      },
    });
  }

  loadCompanyContracts(companyId: TCompanyId): void {
    this.companyService.getCompanyContracts(companyId).subscribe({
      next: (res) => this._contracts.set(res),
      error: (err) => console.error('[CompanyStore] loadCompanyContracts failed', err),
    });
  }

  createContractForUser(
    companyId: TCompanyId,
    userId: TUserId,
    dto: { status: TContractStatusEnum; startDate: string; endDate?: string },
    onSuccess?: () => void,
  ): void {
    this.companyService.createContractForUser({ company_id: companyId, user_id: userId, ...dto }).subscribe({
      next: (res) => {
        this._contracts.update(list => [...list, res.data]);
        onSuccess?.();
      },
      error: (err) => console.error('[CompanyStore] createContractForUser failed', err),
    });
  }

  loadTeams(companyId: TCompanyId): void {
    this.companyService.getCompanyTeams(companyId).subscribe({
      next: (res) => this._teams.set(res.data),
      error: (err) => console.error('[CompanyStore] loadTeams failed', err),
    });
  }

  addService(name: string): void {
    const company = this._company();
    if (!company) return;
    this.companyService.addService(company.id, name).subscribe({
      next: (res) => {
        this._company.update(c => c ? { ...c, services: res.data.services } : c);
      },
      error: (err) => console.error('[CompanyStore] addService failed', err),
    });
  }

  removeService(serviceId: TServiceId): void {
    const company = this._company();
    if (!company) return;
    this.companyService.removeService(company.id, serviceId).subscribe({
      next: (res) => {
        this._company.update(c => c ? { ...c, services: res.data.services } : c);
      },
      error: (err) => console.error('[CompanyStore] removeService failed', err),
    });
  }

  createTeam(name: string, serviceId?: TServiceId): void {
    const company = this._company();
    if (!company) return;
    this.companyService.createTeam({ company_id: company.id, name, service_id: serviceId }).subscribe({
      next: (res) => {
        this._teams.update(teams => [...teams, res.data]);
      },
      error: (err) => console.error('[CompanyStore] createTeam failed', err),
    });
  }

  addTeamMember(teamId: string, userId: string, contractId: string): void {
    this.companyService.addTeamMember(teamId, { user_id: userId, contract_id: contractId }).subscribe({
      error: (err) => console.error('[CompanyStore] addTeamMember failed', err),
    });
  }

  removeTeamMember(teamId: string, userId: string): void {
    this.companyService.removeTeamMember(teamId, userId).subscribe({
      error: (err) => console.error('[CompanyStore] removeTeamMember failed', err),
    });
  }
}
