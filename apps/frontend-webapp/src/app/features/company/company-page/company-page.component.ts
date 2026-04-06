import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { ButtonComponent } from '../../../shared/button/button.component';
import { LoadingStateComponent } from '../../../shared/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CompanyCardComponent } from './company-card/company-card.component';

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
