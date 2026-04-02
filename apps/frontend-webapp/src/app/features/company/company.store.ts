import { inject, Injectable, signal, computed } from '@angular/core';
import { CompanyService } from './company.service';
import type {
  TCompanyAddress,
  TCompanyContractViewModel,
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TCompanyOrgChartViewModel,
  TCompanyId,
  TContractId,
  TContractRole,
  TContractStatus,
  TOrgNodeId,
  TOrgNodeRecord,
  TTeamRole,
  TTeamType,
  TOrgNodeCommunication,
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
  private readonly _orgNodes = signal<TOrgNodeRecord[]>([]);
  private readonly _orgChart = signal<TCompanyOrgChartViewModel | null>(null);
  private readonly _contracts = signal<TCompanyContractViewModel[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Selectors ──────────────────────────────────────────────
  readonly company = this._company.asReadonly();
  readonly companies = this._companies.asReadonly();
  readonly orgNodes = this._orgNodes.asReadonly();
  readonly orgChart = this._orgChart.asReadonly();
  readonly contracts = this._contracts.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasCompany = computed(() => this._company() !== null);

  // ── Company Actions ────────────────────────────────────────

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

  updateCompanyInfo(id: TCompanyId, dto: { name?: string; description?: string; address?: TCompanyAddress; orgLayers?: string[]; integrations?: import('@sh3pherd/shared-types').TCompanyIntegration[]; channels?: import('@sh3pherd/shared-types').TCompanyChannel[] }): void {
    this._loading.set(true);
    this.companyService.updateCompanyInfo(id, dto).subscribe({
      next: (res) => { this._company.set(res.data); this._loading.set(false); },
      error: (err) => { console.error('[CompanyStore] updateCompanyInfo failed', err); this._loading.set(false); },
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

  // ── Org Chart Actions ──────────────────────────────────────

  loadOrgChart(companyId: TCompanyId): void {
    this.companyService.getOrgChart(companyId).subscribe({
      next: (res) => this._orgChart.set(res.data),
      error: (err) => console.error('[CompanyStore] loadOrgChart failed', err),
    });
  }

  // ── Org Node Actions ───────────────────────────────────────

  loadOrgNodes(companyId: TCompanyId): void {
    this.companyService.getCompanyOrgNodes(companyId).subscribe({
      next: (res) => this._orgNodes.set(res.data),
      error: (err) => console.error('[CompanyStore] loadOrgNodes failed', err),
    });
  }

  createOrgNode(
    dto: { company_id: TCompanyId; name: string; parent_id?: TOrgNodeId; type?: TTeamType; color?: string },
    onSuccess?: () => void,
  ): void {
    this.companyService.createOrgNode(dto).subscribe({
      next: (res) => {
        this._orgNodes.update(nodes => [...nodes, res.data]);
        onSuccess?.();
      },
      error: (err) => console.error('[CompanyStore] createOrgNode failed', err),
    });
  }

  updateOrgNode(
    nodeId: TOrgNodeId,
    dto: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] },
    onSuccess?: () => void,
  ): void {
    this.companyService.updateOrgNode(nodeId, dto).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] updateOrgNode failed', err),
    });
  }

  addOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId, contractId: string, teamRole?: TTeamRole, onSuccess?: () => void): void {
    this.companyService.addOrgNodeMember(nodeId, { user_id: userId, contract_id: contractId, team_role: teamRole }).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] addOrgNodeMember failed', err),
    });
  }

  removeOrgNodeMember(nodeId: TOrgNodeId, userId: TUserId, onSuccess?: () => void): void {
    this.companyService.removeOrgNodeMember(nodeId, userId).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] removeOrgNodeMember failed', err),
    });
  }

  // ── Guest Member Actions ─────────────────────────────────

  addGuestMember(nodeId: TOrgNodeId, dto: { display_name: string; title?: string; team_role: TTeamRole }, onSuccess?: () => void): void {
    this.companyService.addGuestMember(nodeId, dto).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] addGuestMember failed', err),
    });
  }

  removeGuestMember(nodeId: TOrgNodeId, guestId: string, onSuccess?: () => void): void {
    this.companyService.removeGuestMember(nodeId, guestId).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] removeGuestMember failed', err),
    });
  }

  // ── Contract Actions ───────────────────────────────────────

  loadCompanyContracts(companyId: TCompanyId): void {
    this.companyService.getCompanyContracts(companyId).subscribe({
      next: (res) => this._contracts.set(res),
      error: (err) => console.error('[CompanyStore] loadCompanyContracts failed', err),
    });
  }

  createContractForUser(
    companyId: TCompanyId,
    userId: TUserId,
    dto: { status: TContractStatus; startDate: string; endDate?: string },
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

  assignContractRole(contractId: TContractId, role: TContractRole, onSuccess?: () => void): void {
    this.companyService.assignContractRole(contractId, role).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] assignContractRole failed', err),
    });
  }

  removeContractRole(contractId: TContractId, role: TContractRole, onSuccess?: () => void): void {
    this.companyService.removeContractRole(contractId, role).subscribe({
      next: () => onSuccess?.(),
      error: (err) => console.error('[CompanyStore] removeContractRole failed', err),
    });
  }
}
