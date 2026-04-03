import { Injectable, signal, computed } from '@angular/core';
import type {
  TCompanyAddress,
  TCompanyContractViewModel,
  TCompanyDetailViewModel,
  TCompanyCardViewModel,
  TCompanyOrgChartViewModel,
  TCompanyId,
  TCompanyIntegration,
  TCompanyChannel,
  TContractId,
  TContractRole,
  TContractStatus,
  TOrgNodeId,
  TOrgNodeRecord,
  TTeamRole,
  TTeamType,
  TOrgNodeCommunication,
  TCompanyInfo,
  TUserId,
} from '@sh3pherd/shared-types';

const MOCK_COMPANY: TCompanyDetailViewModel = {
  id: 'company_mock_001' as TCompanyId,
  name: 'Acme Productions',
  owner_id: 'user_mock_owner' as TUserId,
  status: 'active',
  description: 'A creative production company specializing in music and events.',
  address: {
    street: '42 Rue de la Musique',
    city: 'Paris',
    zip: '75011',
    country: 'France',
  },
  orgLayers: ['Direction', 'Pôle', 'Équipe'],
  integrations: [
    { platform: 'slack', status: 'connected', config: { webhook_url: 'https://hooks.slack.com/services/T00/B00/xxx' }, connectedAt: new Date('2025-12-01') },
  ],
  channels: [
    { id: 'ch_001', name: '#general', platform: 'slack', url: 'https://acme.slack.com/archives/C001' },
    { id: 'ch_002', name: '#design-team', platform: 'slack', url: 'https://acme.slack.com/archives/C002' },
  ],
  activeTeamCount: 5,
  activeContractCount: 12,
};

const MOCK_COMPANIES: TCompanyCardViewModel[] = [
  { id: 'company_mock_001' as TCompanyId, name: 'Acme Productions', status: 'active', createdAt: new Date('2025-01-15') },
  { id: 'company_mock_002' as TCompanyId, name: 'Nova Events', status: 'pending', createdAt: new Date('2025-06-20') },
];

@Injectable({
  providedIn: 'root',
})
export class CompanyMockStore {
  private readonly _company = signal<TCompanyDetailViewModel | null>(MOCK_COMPANY);
  private readonly _companies = signal<TCompanyCardViewModel[]>(MOCK_COMPANIES);
  private readonly _orgNodes = signal<TOrgNodeRecord[]>([]);
  private readonly _orgChart = signal<TCompanyOrgChartViewModel | null>(null);
  private readonly _contracts = signal<TCompanyContractViewModel[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly company = this._company.asReadonly();
  readonly companies = this._companies.asReadonly();
  readonly orgNodes = this._orgNodes.asReadonly();
  readonly orgChart = this._orgChart.asReadonly();
  readonly contracts = this._contracts.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasCompany = computed(() => this._company() !== null);

  createCompany(name: string): void {
    const id = `company_${Date.now()}` as TCompanyId;
    const c: TCompanyDetailViewModel = {
      id, name, owner_id: 'user_mock_owner' as TUserId, status: 'active',
      orgLayers: ['Department', 'Team', 'Sub-team'], integrations: [], channels: [],
      activeTeamCount: 0, activeContractCount: 0,
    };
    this._company.set(c);
    this._companies.update(list => [...list, { id, name, status: 'active', createdAt: new Date() }]);
  }

  loadMyCompany(): void { /* already loaded */ }
  loadMyCompanies(): void { /* already loaded */ }
  loadCompanyById(_id: TCompanyId): void { /* already loaded */ }

  updateCompanyInfo(_id: TCompanyId, dto: TCompanyInfo): void {
    this._company.update(c => {
      if (!c) return c;
      return { ...c, ...dto };
    });
    console.log('[MockStore] updateCompanyInfo', dto);
  }

  deleteCompany(_id: TCompanyId, onSuccess: () => void): void {
    this._company.set(null);
    onSuccess();
  }

  loadOrgChart(_companyId: TCompanyId): void {}
  loadOrgNodes(_companyId: TCompanyId): void {}
  createOrgNode(_dto: { company_id: TCompanyId; name: string; parent_id?: TOrgNodeId; type?: TTeamType; color?: string }, onSuccess?: () => void): void { onSuccess?.(); }
  updateOrgNode(_nodeId: TOrgNodeId, _dto: { name?: string; color?: string; type?: TTeamType; communications?: TOrgNodeCommunication[] }, onSuccess?: () => void): void { onSuccess?.(); }
  addOrgNodeMember(_nodeId: TOrgNodeId, _userId: TUserId, _contractId: string, _teamRole?: TTeamRole, onSuccess?: () => void): void { onSuccess?.(); }
  removeOrgNodeMember(_nodeId: TOrgNodeId, _userId: TUserId, onSuccess?: () => void): void { onSuccess?.(); }
  addGuestMember(_nodeId: TOrgNodeId, _dto: { display_name: string; title?: string; team_role: TTeamRole }, onSuccess?: () => void): void { onSuccess?.(); }
  removeGuestMember(_nodeId: TOrgNodeId, _guestId: string, onSuccess?: () => void): void { onSuccess?.(); }
  loadCompanyContracts(_companyId: TCompanyId): void {}
  createContractForUser(_companyId: TCompanyId, _userId: TUserId, _dto: { status: TContractStatus; startDate: string; endDate?: string }, onSuccess?: () => void): void { onSuccess?.(); }
  assignContractRole(_contractId: TContractId, _role: TContractRole, onSuccess?: () => void): void { onSuccess?.(); }
  removeContractRole(_contractId: TContractId, _role: TContractRole, onSuccess?: () => void): void { onSuccess?.(); }
}
