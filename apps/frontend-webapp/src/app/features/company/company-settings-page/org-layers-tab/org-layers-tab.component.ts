import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompanyStore } from '../../company.store';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { FormSectionComponent } from '../../../../shared/forms/form-section/form-section.component';
import type { TCompanyId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-org-layers-tab',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent, FormSectionComponent],
  templateUrl: './org-layers-tab.component.html',
  styleUrl: './org-layers-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgLayersTabComponent {
  private readonly store = inject(CompanyStore);

  readonly companyId = input.required<TCompanyId>();
  readonly editLayers = signal<string[]>([]);
  readonly saving = signal(false);

  private original = signal<string[]>([]);

  readonly dirty = computed(() => {
    const e = this.editLayers();
    const o = this.original();
    return e.length !== o.length || e.some((v, i) => v !== o[i]);
  });

  constructor() {
    effect(() => {
      const c = this.store.company();
      if (!c) return;
      const layers = [...(c.orgLayers ?? ['Department', 'Team', 'Sub-team'])];
      this.editLayers.set([...layers]);
      this.original.set(layers);
    });
  }

  updateLayer(index: number, value: string): void {
    this.editLayers.update(layers => {
      const copy = [...layers];
      copy[index] = value;
      return copy;
    });
  }

  addLayer(): void {
    this.editLayers.update(layers => [...layers, '']);
  }

  removeLayer(index: number): void {
    this.editLayers.update(layers => layers.filter((_, i) => i !== index));
  }

  save(): void {
    const layers = this.editLayers().filter(l => l.trim());
    this.saving.set(true);
    this.store.updateCompanyInfo(this.companyId(), { orgLayers: layers } as any);
    this.original.set([...layers]);
    setTimeout(() => this.saving.set(false), 800);
  }
}
