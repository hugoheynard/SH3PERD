import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { CompanyStore } from '../../company.store';
import type { TCompanyId } from '@sh3pherd/shared-types';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-danger-zone-tab',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  templateUrl: './danger-zone-tab.component.html',
  styleUrl: './danger-zone-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DangerZoneTabComponent {
  private readonly store = inject(CompanyStore);
  private readonly router = inject(Router);

  readonly companyId = input.required<TCompanyId>();

  readonly status = signal('');
  readonly id = signal('');
  readonly idRevealed = signal(false);
  readonly copied = signal(false);
  readonly confirmingDelete = signal(false);

  constructor() {
    effect(() => {
      const c = this.store.company();
      if (!c) return;
      this.status.set(c.status);
      this.id.set(c.id);
    });
  }

  revealId(): void {
    this.idRevealed.set(true);
  }

  copyId(): void {
    navigator.clipboard.writeText(this.id());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  requestDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    this.store.deleteCompany(this.companyId(), () =>
      this.router.navigate(['/app/company']),
    );
  }
}
