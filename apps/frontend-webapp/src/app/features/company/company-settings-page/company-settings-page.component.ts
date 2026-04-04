import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { SettingsTab } from './tab-names.enum';
import { TabNavComponent, type TabNavItem } from '../../../shared/tab-nav/tab-nav.component';
import { CompanyInfoTabComponent } from './company-info-tab/company-info-tab.component';
import { OrgLayersTabComponent } from './org-layers-tab/org-layers-tab.component';
import { ChannelsTabComponent } from './channels-tab/channels-tab.component';
import { DangerZoneTabComponent } from './danger-zone-tab/danger-zone-tab.component';
import type { TCompanyId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-company-settings-page',
  standalone: true,
  imports: [CommonModule, TabNavComponent, CompanyInfoTabComponent, OrgLayersTabComponent, ChannelsTabComponent, DangerZoneTabComponent],
  templateUrl: './company-settings-page.component.html',
  styleUrl: './company-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySettingsPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly SettingsTab = SettingsTab;
  readonly activeTab = signal<string>(SettingsTab.INFOS);
  readonly companyId = signal<TCompanyId | null>(null);

  readonly settingsTabs: TabNavItem[] = [
    { key: SettingsTab.INFOS,      label: 'Infos',            icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
    { key: SettingsTab.ORG_LAYERS, label: 'Hierarchy labels', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
    { key: SettingsTab.CHANNELS,   label: 'Channels',         icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z' },
    { key: SettingsTab.SETTINGS,   label: 'Settings',         icon: 'M19.14,12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24,0-.43.17-.47.41l-.36,2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47,0-.59.22L2.74,8.87c-.12.21-.08.47.12.61l2.03,1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03,1.58c-.18.14-.23.41-.12.61l1.92,3.32c.12.22.37.29.59.22l2.39-.96c.5.38,1.03.7,1.62.94l.36,2.54c.05.24.24.41.48.41h3.84c.24,0,.44-.17.47-.41l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39.96c.22.08.47,0,.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6,3.6,1.62,3.6,3.6-1.62,3.6-3.6,3.6z' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    this.companyId.set(id);
    if (id && !this.store.company()) {
      this.store.loadCompanyById(id);
    }

    // Handle OAuth return (Slack redirects back with ?slack=connected)
    const slackResult = this.route.snapshot.queryParamMap.get('slack');
    if (slackResult === 'connected') {
      this.activeTab.set(SettingsTab.CHANNELS);
      if (id) this.store.loadCompanyById(id);
    } else if (slackResult === 'error') {
      this.activeTab.set(SettingsTab.CHANNELS);
      console.error('[Settings] Slack OAuth failed');
    }
  }

  goBack(): void {
    const id = this.companyId();
    this.router.navigate(['/app/company', id]);
  }

  setTab(tab: string): void {
    this.activeTab.set(tab as SettingsTab);
  }
}
