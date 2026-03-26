import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import type { TCompanyId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-service-list-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-list-page.component.html',
  styleUrl: './service-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceListPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly newServiceName = signal('');
  readonly addingService = signal(false);

  private getCompanyId(): string | null {
    // :id → services → '' (this route)  — need to go up two levels
    return this.route.snapshot.parent?.parent?.paramMap.get('id') ?? null;
  }

  ngOnInit(): void {
    const id = this.getCompanyId() as TCompanyId;
    if (id && !this.store.hasCompany()) {
      this.store.loadCompanyById(id);
    }
  }

  goBack(): void {
    const id = this.getCompanyId();
    this.router.navigate(['/app/company', id]);
  }

  goToService(serviceId: string): void {
    const id = this.getCompanyId();
    this.router.navigate(['/app/company', id, 'services', serviceId]);
  }

  startAdd(): void { this.addingService.set(true); }
  cancelAdd(): void { this.addingService.set(false); this.newServiceName.set(''); }

  confirmAdd(): void {
    const name = this.newServiceName().trim();
    if (!name) return;
    this.store.addService(name);
    this.newServiceName.set('');
    this.addingService.set(false);
  }

  onNameInput(e: Event): void {
    this.newServiceName.set((e.target as HTMLInputElement).value);
  }

  getTeamCount(serviceId: string): number {
    return this.store.teams().filter(t => t.service_id === serviceId).length;
  }

  getServiceColor(serviceId: string): string {
    return this.store.services().find(s => s.id === serviceId)?.color ?? 'var(--accent-color)';
  }
}
