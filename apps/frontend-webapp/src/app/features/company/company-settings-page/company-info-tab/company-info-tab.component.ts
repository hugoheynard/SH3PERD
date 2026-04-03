import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { FormSectionComponent } from '../../../../shared/forms/form-section/form-section.component';
import { CompanyInfoTabStore } from './company-info-tab.store';
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
  providers: [CompanyInfoTabStore],
  templateUrl: './company-info-tab.component.html',
  styleUrl: './company-info-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyInfoTabComponent implements OnInit {
  private readonly store = inject(CompanyInfoTabStore);

  readonly companyId = input.required<TCompanyId>();

  readonly form = signal<TCompanyInfo>({ ...EMPTY_FORM });
  readonly saving = this.store.saving;
  readonly loading = this.store.loading;

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
      const info = this.store.info();
      if (!info) return;

      const snapshot: TCompanyInfo = {
        name: info.name,
        description: info.description,
        address: { ...info.address },
      };
      this.form.set({ ...snapshot });
      this.original.set(snapshot);
    });
  }

  ngOnInit(): void {
    this.store.load(this.companyId());
  }

  patchField(field: 'name' | 'description', value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  patchAddress(field: 'street' | 'city' | 'zip' | 'country', value: string): void {
    this.form.update(f => ({ ...f, address: { ...f.address, [field]: value } }));
  }

  onSave(): void {
    if (!this.dirty() || this.saving()) return;
    this.store.save(this.companyId(), this.form());
  }
}
