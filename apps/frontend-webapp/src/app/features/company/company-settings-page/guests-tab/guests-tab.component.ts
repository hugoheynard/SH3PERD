import { ChangeDetectionStrategy, Component, inject, input, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../company.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { AvatarComponent } from '../../../../shared/avatar/avatar.component';
import type { TCompanyId } from '@sh3pherd/shared-types';
import { IconComponent } from '../../../../shared/icon/icon.component';

type GuestVM = {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_guest: boolean;
};

@Component({
  selector: 'app-guests-tab',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AvatarComponent, IconComponent],
  templateUrl: './guests-tab.component.html',
  styleUrl: './guests-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestsTabComponent implements OnInit {
  private readonly service = inject(CompanyService);
  private readonly toast = inject(ToastService);

  readonly companyId = input.required<TCompanyId>();

  readonly guests = signal<GuestVM[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal('');

  // Create form
  readonly creating = signal(false);
  readonly newFirstName = signal('');
  readonly newLastName = signal('');
  readonly newEmail = signal('');
  readonly newPhone = signal('');

  // Edit state
  readonly editingId = signal<string | null>(null);
  readonly editFirstName = signal('');
  readonly editLastName = signal('');
  readonly editEmail = signal('');
  readonly editPhone = signal('');

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(): void {
    this.loading.set(true);
    this.service.getCompanyGuests(this.companyId()).subscribe({
      next: (guests) => {
        this.guests.set(guests);
        this.loading.set(false);
      },
      error: () => {
        this.guests.set([]);
        this.loading.set(false);
      },
    });
  }

  get filteredGuests(): GuestVM[] {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.guests();
    return this.guests().filter(g => {
      const name = `${g.first_name ?? ''} ${g.last_name ?? ''}`.toLowerCase();
      return name.includes(q) || (g.email ?? '').toLowerCase().includes(q);
    });
  }

  // ── Create ──────────────────────────────────────────────

  startCreate(): void {
    this.creating.set(true);
    this.newFirstName.set('');
    this.newLastName.set('');
    this.newEmail.set('');
    this.newPhone.set('');
  }

  cancelCreate(): void {
    this.creating.set(false);
  }

  confirmCreate(): void {
    const first_name = this.newFirstName().trim();
    const email = this.newEmail().trim();
    if (!first_name || !email) return;

    const lastName = this.newLastName().trim();
    const phone = this.newPhone().trim() || undefined;

    this.service.createGuest({
      first_name,
      last_name: lastName,
      email,
      phone,
      company_id: this.companyId(),
    }).subscribe({
      next: () => {
        this.toast.show('Guest created', 'success');
        this.creating.set(false);
        // Reload from the backend — the guest is now linked to the company via guest_company
        this.loadGuests();
      },
      error: () => {
        this.toast.show('Failed to create guest', 'error');
      },
    });
  }

  // ── Edit ────────────────────────────────────────────────

  startEdit(guest: GuestVM): void {
    this.editingId.set(guest.user_id);
    this.editFirstName.set(guest.first_name ?? '');
    this.editLastName.set(guest.last_name ?? '');
    this.editEmail.set(guest.email ?? '');
    this.editPhone.set(guest.phone ?? '');
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  confirmEdit(): void {
    const userId = this.editingId();
    if (!userId) return;

    this.service.updateGuest(userId, {
      first_name: this.editFirstName().trim(),
      last_name: this.editLastName().trim(),
      email: this.editEmail().trim(),
      phone: this.editPhone().trim() || undefined,
    }).subscribe({
      next: () => {
        this.toast.show('Guest updated', 'success');
        this.editingId.set(null);
        this.loadGuests();
      },
      error: () => {
        this.toast.show('Failed to update guest', 'error');
      },
    });
  }

  onInput(signal: any, event: Event): void {
    signal.set((event.target as HTMLInputElement).value);
  }
}
