import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { FormSectionComponent } from '../../../../shared/forms/form-section/form-section.component';
import { CompanyStore } from '../../company.store';
import type { TCompanyId, TCompanyInfo } from '@sh3pherd/shared-types';

const EMPTY_FORM: TCompanyInfo = {
  name: '',
  description: '',
  address: { street: '', city: '', zip: '', country: '' },
};

@Component({
  selector: 'app-company-info-tab',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent, FormSectionComponent],
  templateUrl: './company-info-tab.component.html',
  styleUrl: './company-info-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyInfoTabComponent {
  private readonly store = inject(CompanyStore);

  readonly companyId = input.required<TCompanyId>();

  readonly form = signal<TCompanyInfo>({ ...EMPTY_FORM });
  readonly saving = signal(false);

  private original = signal<TCompanyInfo>({ ...EMPTY_FORM });

  readonly dirty = computed(() => {
    const f = this.form();
    const o = this.original();
    return (
      f.name !== o.name ||
      f.description !== o.description ||
      f.address.street !== o.address.street ||
      f.address.city !== o.address.city ||
      f.address.zip !== o.address.zip ||
      f.address.country !== o.address.country
    );
  });

  constructor() {
    effect(() => {
      const c = this.store.company();
      if (!c) return;

      const snapshot: TCompanyInfo = {
        name: c.name,
        description: c.description ?? '',
        address: {
          street: c.address?.street ?? '',
          city: c.address?.city ?? '',
          zip: c.address?.zip ?? '',
          country: c.address?.country ?? '',
        },
      };
      this.form.set({ ...snapshot });
      this.original.set(snapshot);
    });
  }

  patchField(field: 'name' | 'description', value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  patchAddress(field: 'street' | 'city' | 'zip' | 'country', value: string): void {
    this.form.update(f => ({ ...f, address: { ...f.address, [field]: value } }));
  }

  onSave(): void {
    if (!this.dirty()) return;

    const f = this.form();
    this.saving.set(true);

    this.store.updateCompanyInfo(this.companyId(), {
      name: f.name || undefined,
      description: f.description || undefined,
      address: f.address,
    });

    this.original.set({ ...f });
    setTimeout(() => this.saving.set(false), 800);
  }
}
