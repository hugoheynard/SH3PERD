import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyStore } from '../company.store';

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [],
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

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getCompanyColor(id: string): string {
    const colors = ['#06a4a4', '#63b3ed', '#68d391', '#f6ad55', '#b794f4', '#76e4f7'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  }
}
