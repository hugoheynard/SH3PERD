import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyStore } from '../company.store';
import { CompanyService } from '../company.service';
import type { TCompanyId, TServiceId, TServiceDetailViewModel } from '@sh3pherd/shared-types';

export const SERVICE_COLORS = [
  '#63b3ed', '#68d391', '#f6ad55', '#fc8181',
  '#b794f4', '#76e4f7', '#fbb6ce', '#f687b3',
];

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-detail-page.component.html',
  styleUrl: './service-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailPageComponent implements OnInit {
  readonly store = inject(CompanyStore);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly detail = signal<TServiceDetailViewModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // ── Edit service ───────────────────────────────────────
  readonly editing = signal(false);
  readonly editName = signal('');
  readonly editColor = signal('');
  readonly saving = signal(false);
  readonly COLORS = SERVICE_COLORS;

  // ── Add team ───────────────────────────────────────────
  readonly addingTeam = signal(false);
  readonly newTeamName = signal('');
  readonly creatingTeam = signal(false);

  private companyId!: TCompanyId;
  private serviceId!: TServiceId;

  ngOnInit(): void {
    this.companyId = this.route.snapshot.parent?.parent?.paramMap.get('id') as TCompanyId;
    this.serviceId = this.route.snapshot.paramMap.get('serviceId') as TServiceId;

    if (!this.companyId || !this.serviceId) {
      this.error.set('Missing parameters');
      this.loading.set(false);
      return;
    }

    if (!this.store.hasCompany()) {
      this.store.loadCompanyById(this.companyId);
    }

    this.loadDetail();
  }

  loadDetail(): void {
    this.loading.set(true);
    this.companyService.getServiceDetail(this.companyId, this.serviceId).subscribe({
      next: (res) => { this.detail.set(res.data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load service detail'); this.loading.set(false); },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/company', this.companyId, 'services']);
  }

  // ── Edit ───────────────────────────────────────────────

  startEdit(): void {
    const d = this.detail();
    if (!d) return;
    this.editName.set(d.name);
    this.editColor.set(d.color ?? '');
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveEdit(): void {
    const name = this.editName().trim();
    if (!name) return;
    this.saving.set(true);
    this.companyService.updateService(this.companyId, this.serviceId, {
      name,
      color: this.editColor() || undefined,
    }).subscribe({
      next: (res) => {
        this.detail.update(d => d ? { ...d, name: res.data.name, color: res.data.color } : d);
        // Also update company store so the side panel reflects new name/color
        this.store.loadCompanyById(this.companyId);
        this.saving.set(false);
        this.editing.set(false);
      },
      error: () => { this.saving.set(false); },
    });
  }

  onEditNameInput(e: Event): void {
    this.editName.set((e.target as HTMLInputElement).value);
  }

  selectColor(c: string): void {
    this.editColor.set(this.editColor() === c ? '' : c);
  }

  // ── Add team ───────────────────────────────────────────

  startAddTeam(): void { this.addingTeam.set(true); }
  cancelAddTeam(): void { this.addingTeam.set(false); this.newTeamName.set(''); }

  onTeamNameInput(e: Event): void {
    this.newTeamName.set((e.target as HTMLInputElement).value);
  }

  confirmAddTeam(): void {
    const name = this.newTeamName().trim();
    if (!name) return;
    this.creatingTeam.set(true);
    this.companyService.createTeam({ company_id: this.companyId, name, service_id: this.serviceId }).subscribe({
      next: () => {
        this.newTeamName.set('');
        this.addingTeam.set(false);
        this.creatingTeam.set(false);
        this.loadDetail();
      },
      error: () => { this.creatingTeam.set(false); },
    });
  }

  // ── Helpers ────────────────────────────────────────────

  getServiceColor(): string {
    return this.detail()?.color ?? 'var(--accent-color, #63b3ed)';
  }

  getInitials(firstName?: string, lastName?: string): string {
    return [(firstName?.[0] ?? ''), (lastName?.[0] ?? '')].join('').toUpperCase() || '?';
  }

  getMemberColor(userId: string): string {
    const colors = SERVICE_COLORS;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getMemberName(firstName?: string, lastName?: string, userId?: string): string {
    const name = [firstName, lastName].filter(Boolean).join(' ');
    return name || (userId ? userId.slice(0, 12) + '…' : '?');
  }

  getTotalMembers(): number {
    return this.detail()?.teams.reduce((acc, t) => acc + t.members.length, 0) ?? 0;
  }
}
