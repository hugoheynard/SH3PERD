import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { ContractCreationPanelComponent } from '../contract-creation-panel/contract-creation-panel.component';
import { CompanyService } from '../company.service';
import type { TTeamRecord, TCompanyId, TContractId, TCompanyOrgChartViewModel, TServiceTeamViewModel } from '@sh3pherd/shared-types';

type CompanyTab = 'teams' | 'contracts' | 'orgchart';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [CommonModule, ContractCreationPanelComponent],
  templateUrl: './company-detail-page.component.html',
  styleUrl: './company-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly companyService = inject(CompanyService);

  readonly activeTab = signal<CompanyTab>('teams');
  readonly newTeamName = signal('');
  readonly addingTeam = signal(false);
  readonly showContractPanel = signal(false);

  // Orgchart state
  readonly orgChart = signal<TCompanyOrgChartViewModel | null>(null);
  readonly orgChartLoading = signal(false);
  readonly orgChartError = signal<string | null>(null);
  readonly expandedServices = signal<Set<string>>(new Set());
  readonly expandedTeams = signal<Set<string>>(new Set());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    if (id) {
      this.store.loadCompanyById(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/app/company']);
  }

  goToSettings(): void {
    const company = this.store.company();
    if (!company) return;
    this.router.navigate(['/app/company', company.id, 'settings']);
  }

  goToServices(): void {
    const company = this.store.company();
    if (!company) return;
    this.router.navigate(['/app/company', company.id, 'services']);
  }

  goToService(serviceId: string): void {
    const company = this.store.company();
    if (!company) return;
    this.router.navigate(['/app/company', company.id, 'services', serviceId]);
  }

  setTab(tab: CompanyTab): void {
    this.activeTab.set(tab);
    const company = this.store.company();
    if (!company) return;
    if (tab === 'teams') this.store.loadTeams(company.id);
    if (tab === 'contracts') this.store.loadCompanyContracts(company.id);
    if (tab === 'orgchart') this.loadOrgChart(company.id as TCompanyId);
  }

  loadOrgChart(companyId: TCompanyId): void {
    if (this.orgChart()) return; // already loaded
    this.orgChartLoading.set(true);
    this.orgChartError.set(null);
    this.companyService.getOrgChart(companyId).subscribe({
      next: (res) => {
        this.orgChart.set(res.data);
        // expand all services by default
        const allServiceIds = new Set(res.data.services.map(s => s.service_id));
        this.expandedServices.set(allServiceIds);
        this.orgChartLoading.set(false);
      },
      error: () => {
        this.orgChartError.set('Failed to load org chart');
        this.orgChartLoading.set(false);
      },
    });
  }

  toggleService(serviceId: string): void {
    const s = new Set(this.expandedServices());
    s.has(serviceId) ? s.delete(serviceId) : s.add(serviceId);
    this.expandedServices.set(s);
  }

  toggleTeam(teamId: string): void {
    const s = new Set(this.expandedTeams());
    s.has(teamId) ? s.delete(teamId) : s.add(teamId);
    this.expandedTeams.set(s);
  }

  isServiceExpanded(serviceId: string): boolean {
    return this.expandedServices().has(serviceId);
  }

  isTeamExpanded(teamId: string): boolean {
    return this.expandedTeams().has(teamId);
  }

  orgTeamMemberCount(team: TServiceTeamViewModel): number {
    return team.members.length;
  }

  startAddTeam(): void {
    this.addingTeam.set(true);
  }

  cancelAddTeam(): void {
    this.addingTeam.set(false);
    this.newTeamName.set('');
  }

  confirmAddTeam(): void {
    const name = this.newTeamName().trim();
    if (!name) return;
    this.store.createTeam(name);
    this.newTeamName.set('');
    this.addingTeam.set(false);
  }

  onTeamNameInput(event: Event): void {
    this.newTeamName.set((event.target as HTMLInputElement).value);
  }

  getActiveMemberCount(team: TTeamRecord): number {
    return team.members.filter(m => !m.leftAt).length;
  }

  getInitials(userId: string): string {
    return userId.slice(-4, -2).toUpperCase();
  }

  getMemberColor(userId: string): string {
    const colors = ['#63b3ed', '#68d391', '#f6ad55', '#fc8181', '#b794f4', '#76e4f7', '#fbb6ce'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getServiceName(serviceId: string | undefined): string {
    if (!serviceId) return '';
    const service = this.store.services().find(s => s.id === serviceId);
    return service?.name ?? '';
  }

  getServiceColor(serviceId: string | undefined): string {
    if (!serviceId) return 'transparent';
    return this.store.services().find(s => s.id === serviceId)?.color ?? 'var(--accent-color)';
  }

  goToContract(contractId: TContractId): void {
    const company = this.store.company();
    if (!company) return;
    this.router.navigate(['/app/company', company.id, 'contracts', contractId]);
  }
}
