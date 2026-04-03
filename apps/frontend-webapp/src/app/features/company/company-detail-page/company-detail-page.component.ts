import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { OrgChartStore } from '../orgchart.store';
import { ContractStore } from '../contract.store';
import { CompanyHeaderComponent } from './company-header/company-header.component';
import { ContractsTabComponent } from './contracts-tab/contracts-tab.component';
import { OrgchartTabComponent } from './orgchart-tab/orgchart-tab.component';
import type { TCompanyId } from '@sh3pherd/shared-types';

type CompanyTab = 'orgchart' | 'contracts';

@Component({
  selector: 'app-company-detail-page',
  standalone: true,
  imports: [CompanyHeaderComponent, ContractsTabComponent, OrgchartTabComponent],
  templateUrl: './company-detail-page.component.html',
  styleUrl: './company-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly orgChartStore = inject(OrgChartStore);
  private readonly contractStore = inject(ContractStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<CompanyTab>('orgchart');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    if (id) {
      this.store.loadCompanyById(id);
      this.orgChartStore.loadOrgChart(id);
      this.contractStore.loadCompanyContracts(id);
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

  setTab(tab: CompanyTab): void {
    this.activeTab.set(tab);
  }
}
