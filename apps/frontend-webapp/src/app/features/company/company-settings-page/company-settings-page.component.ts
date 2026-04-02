import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { SettingsTab } from './tab-names.enum';
import { SettingsNavComponent } from './settings-nav/settings-nav.component';
import { CompanyInfoTabComponent } from './company-info-tab/company-info-tab.component';
import { OrgLayersTabComponent } from './org-layers-tab/org-layers-tab.component';
import { ChannelsTabComponent } from './channels-tab/channels-tab.component';
import { DangerZoneTabComponent } from './danger-zone-tab/danger-zone-tab.component';
import type { TCompanyId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-company-settings-page',
  standalone: true,
  imports: [CommonModule, SettingsNavComponent, CompanyInfoTabComponent, OrgLayersTabComponent, ChannelsTabComponent, DangerZoneTabComponent],
  templateUrl: './company-settings-page.component.html',
  styleUrl: './company-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySettingsPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly SettingsTab = SettingsTab;
  readonly activeTab = signal(SettingsTab.INFOS);
  readonly companyId = signal<TCompanyId | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    this.companyId.set(id);
    if (id && !this.store.company()) {
      this.store.loadCompanyById(id);
    }
  }

  goBack(): void {
    const id = this.companyId();
    this.router.navigate(['/app/company', id]);
  }

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }
}
