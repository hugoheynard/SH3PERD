import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { ButtonComponent } from '../../../shared/button/button.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CompanyCardComponent } from './company-card/company-card.component';

const BUILDING_ICON = 'M19,3H5C3.346,3,2,4.346,2,6v16h20V6C22,4.346,20.654,3,19,3ZM4,20V6c0-.551,.449-1,1-1h14c.551,0,1,.449,1,1V20H13V15h-2v5H4ZM7,8h2v2H7v-2Zm0,4h2v2H7v-2Zm4-4h2v2H11v-2Zm0,4h2v2H11v-2Zm4-4h2v2H15v-2Zm0,4h2v2H15v-2Z';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LoadingStateComponent, EmptyStateComponent, CompanyCardComponent],
  templateUrl: './company-page.component.html',
  styleUrl: './company-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);

  readonly creatingCompany = signal(false);
  readonly newCompanyName = signal('');
  readonly buildingIcon = BUILDING_ICON;

  ngOnInit(): void {
    this.store.loadMyCompanies();
  }

  goToCompany(id: string): void {
    this.router.navigate(['/app/company', id]);
  }

  startCreateCompany(): void {
    this.creatingCompany.set(true);
  }

  cancelCreateCompany(): void {
    this.creatingCompany.set(false);
    this.newCompanyName.set('');
  }

  confirmCreateCompany(): void {
    const name = this.newCompanyName().trim();
    if (!name) return;
    this.store.createCompany(name);
    this.cancelCreateCompany();
  }

  onCompanyNameInput(e: Event): void {
    this.newCompanyName.set((e.target as HTMLInputElement).value);
  }
}
