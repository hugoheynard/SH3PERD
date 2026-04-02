import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { CompanyStore } from '../../company.store';
import type { TCompanyId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-danger-zone-tab',
  standalone: true,
  imports: [ButtonComponent],
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
  readonly confirmingDelete = signal(false);

  constructor() {
    effect(() => {
      const c = this.store.company();
      if (!c) return;
      this.status.set(c.status);
      this.id.set(c.id);
    });
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
