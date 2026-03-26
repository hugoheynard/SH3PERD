import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import type { TCompanyId, TCompanyAdminRole, TUserId } from '@sh3pherd/shared-types';

type SettingsTab = 'infos' | 'settings' | 'admin';

@Component({
  selector: 'app-company-settings-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-settings-page.component.html',
  styleUrl: './company-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySettingsPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeTab = signal<SettingsTab>('infos');
  private companyId = signal<TCompanyId | null>(null);

  // ── Infos tab ──────────────────────────────────────────────
  readonly editName = signal('');
  readonly editDescription = signal('');
  readonly editStreet = signal('');
  readonly editCity = signal('');
  readonly editZip = signal('');
  readonly editCountry = signal('');
  readonly infosSaving = signal(false);

  // ── Admin tab ──────────────────────────────────────────────
  readonly newAdminId = signal('');
  readonly newAdminRole = signal<TCompanyAdminRole>('admin');
  readonly addingAdmin = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as TCompanyId;
    this.companyId.set(id);
    if (id && !this.store.company()) {
      this.store.loadCompanyById(id);
    } else {
      this.populateInfosForm();
    }
  }

  private populateInfosForm(): void {
    const c = this.store.company();
    if (!c) return;
    this.editName.set(c.name);
    this.editDescription.set(c.description ?? '');
    this.editStreet.set(c.address?.street ?? '');
    this.editCity.set(c.address?.city ?? '');
    this.editZip.set(c.address?.zip ?? '');
    this.editCountry.set(c.address?.country ?? '');
  }

  goBack(): void {
    const id = this.companyId();
    this.router.navigate(['/app/company', id]);
  }

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
    if (tab === 'infos') this.populateInfosForm();
  }

  // ── Infos tab ──────────────────────────────────────────────

  onInput(field: 'name' | 'description' | 'street' | 'city' | 'zip' | 'country', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const map = { name: this.editName, description: this.editDescription, street: this.editStreet, city: this.editCity, zip: this.editZip, country: this.editCountry };
    map[field].set(value);
  }

  saveInfos(): void {
    const id = this.companyId();
    if (!id) return;
    this.infosSaving.set(true);
    this.store.updateCompanyInfo(id, {
      name: this.editName() || undefined,
      description: this.editDescription() || undefined,
      address: {
        street: this.editStreet() || undefined,
        city: this.editCity() || undefined,
        zip: this.editZip() || undefined,
        country: this.editCountry() || undefined,
      },
    });
    // optimistic — loading flag is handled in store
    setTimeout(() => this.infosSaving.set(false), 800);
  }

  // ── Admin tab ──────────────────────────────────────────────

  onAdminIdInput(event: Event): void {
    this.newAdminId.set((event.target as HTMLInputElement).value.trim());
  }

  setAdminRole(role: TCompanyAdminRole): void {
    this.newAdminRole.set(role);
  }

  addAdmin(): void {
    const id = this.companyId();
    const userId = this.newAdminId();
    if (!id || !userId) return;
    this.store.addAdmin(id, userId as TUserId, this.newAdminRole());
    this.newAdminId.set('');
    this.addingAdmin.set(false);
  }

  removeAdmin(userId: string): void {
    const id = this.companyId();
    if (!id) return;
    this.store.removeAdmin(id, userId as TUserId);
  }

  getRoleLabel(role: TCompanyAdminRole): string {
    return role === 'admin' ? 'Admin' : 'Viewer';
  }

  getRoleColor(role: TCompanyAdminRole): string {
    return role === 'admin' ? '#b794f4' : '#63b3ed';
  }

  getInitials(userId: string): string {
    return userId.slice(-4, -2).toUpperCase();
  }

  getMemberColor(userId: string): string {
    const colors = ['#63b3ed', '#68d391', '#f6ad55', '#fc8181', '#b794f4', '#76e4f7', '#fbb6ce'];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  // ── Settings tab ───────────────────────────────────────────

  confirmingDelete = signal(false);

  requestDelete(): void { this.confirmingDelete.set(true); }
  cancelDelete(): void { this.confirmingDelete.set(false); }

  confirmDelete(): void {
    const id = this.companyId();
    if (!id) return;
    this.store.deleteCompany(id, () => this.router.navigate(['/app/company']));
  }
}
