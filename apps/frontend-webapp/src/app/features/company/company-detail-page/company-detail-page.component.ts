import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { ContractCreationPanelComponent } from '../contract-creation-panel/contract-creation-panel.component';
import type { TTeamRecord, TCompanyId } from '@sh3pherd/shared-types';

type CompanyTab = 'teams' | 'contracts';

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

  readonly activeTab = signal<CompanyTab>('teams');
  readonly newTeamName = signal('');
  readonly addingTeam = signal(false);
  readonly showContractPanel = signal(false);

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
}
