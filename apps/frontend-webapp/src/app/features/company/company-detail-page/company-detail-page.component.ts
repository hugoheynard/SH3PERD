import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { OrgChartStore } from '../orgchart.store';
import { ContractStore } from '../contract.store';
import { CompanyHeaderComponent } from './company-header/company-header.component';
import { ContractsTabComponent } from './contracts-tab/contracts-tab.component';
import { OrgchartTabComponent } from './orgchart-tab/orgchart-tab.component';
import { CompanyInfoTabComponent } from '../company-settings-page/company-info-tab/company-info-tab.component';
import { OrgLayersTabComponent } from '../company-settings-page/org-layers-tab/org-layers-tab.component';
import { ChannelsTabComponent } from '../company-settings-page/channels-tab/channels-tab.component';
import { DangerZoneTabComponent } from '../company-settings-page/danger-zone-tab/danger-zone-tab.component';
import { GuestsTabComponent } from '../company-settings-page/guests-tab/guests-tab.component';
import { TabNavComponent, type TabNavItem } from '../../../shared/tab-nav/tab-nav.component';
import { SettingsTab } from '../company-settings-page/tab-names.enum';
import type { TCompanyId } from '@sh3pherd/shared-types';
import { ContractsService } from '../../contracts/services/contracts.service';
import { UserContextService } from '../../../core/services/user-context.service';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [
    CompanyHeaderComponent, ContractsTabComponent, OrgchartTabComponent,
    CompanyInfoTabComponent, OrgLayersTabComponent, ChannelsTabComponent, GuestsTabComponent, DangerZoneTabComponent,
    TabNavComponent,
  ],
  templateUrl: './company-detail-page.component.html',
  styleUrl: './company-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly orgChartStore = inject(OrgChartStore);
  private readonly contractStore = inject(ContractStore);
  private readonly contractsService = inject(ContractsService);
  private readonly userCtx = inject(UserContextService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<string>('orgchart');

  readonly SettingsTab = SettingsTab;

  readonly detailTabs: TabNavItem[] = [
    { key: 'orgchart',  label: 'Organigramme', icon: 'M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3h7zM7 9H4V5h3v4zm10 6h3v4h-3v-4zm0-10v4h3V5h-3z' },
    { key: 'contracts', label: 'Contracts',     icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
    { key: 'settings',  label: 'Settings',     icon: 'M19.14,12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24,0-.43.17-.47.41l-.36,2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47,0-.59.22L2.74,8.87c-.12.21-.08.47.12.61l2.03,1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03,1.58c-.18.14-.23.41-.12.61l1.92,3.32c.12.22.37.29.59.22l2.39-.96c.5.38,1.03.7,1.62.94l.36,2.54c.05.24.24.41.48.41h3.84c.24,0,.44-.17.47-.41l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39.96c.22.08.47,0,.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6,3.6,1.62,3.6,3.6-1.62,3.6-3.6,3.6z' },
  ];

  readonly settingsTabs: TabNavItem[] = [
    { key: SettingsTab.INFOS,      label: 'Infos',            icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
    { key: SettingsTab.ORG_LAYERS, label: 'Hierarchy labels', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
    { key: SettingsTab.CHANNELS,   label: 'Channels',         icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z' },
    { key: SettingsTab.GUESTS,     label: 'Guests',           icon: 'M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { key: SettingsTab.SETTINGS,   label: 'Danger zone',      icon: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
  ];

  readonly activeSettingsTab = signal<string>(SettingsTab.INFOS);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    if (id) {
      // loadCompanyById is NOT contract-scoped — can fire immediately
      this.store.loadCompanyById(id);
      // Resolve workspace first, then load contract-scoped data
      this.resolveWorkspace(id);
    }

    // Handle query params (e.g. Slack OAuth return: ?tab=settings&slack=connected)
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab) this.activeTab.set(tab);

    const slackResult = this.route.snapshot.queryParamMap.get('slack');
    if (slackResult === 'connected') {
      this.activeTab.set('settings');
      this.activeSettingsTab.set(SettingsTab.CHANNELS);
      if (id) this.store.loadCompanyById(id);
    } else if (slackResult === 'error') {
      this.activeTab.set('settings');
      this.activeSettingsTab.set(SettingsTab.CHANNELS);
    }
  }

  /**
   * Resolve the user's active contract for this company and set it as the workspace.
   * Once set, loads all contract-scoped data (orgchart, contracts).
   * If no active contract is found, the user has no access — redirect to company list.
   */
  private resolveWorkspace(companyId: TCompanyId): void {
    this.contractsService.getCurrentUserContractList().subscribe({
      next: (contracts) => {
        const active = contracts.find(c => c.company_id === companyId && c.status === 'active');
        if (active) {
          this.userCtx.setWorkspace(active.id);
          // Now that workspace is set, load contract-scoped data
          this.orgChartStore.loadOrgChart(companyId);
          this.contractStore.loadCompanyContracts(companyId);
        } else {
          console.warn('[CompanyDetail] No active contract for this company — redirecting');
          this.router.navigate(['/app/company']);
        }
      },
      error: () => {
        this.router.navigate(['/app/company']);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/company']);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }
}
