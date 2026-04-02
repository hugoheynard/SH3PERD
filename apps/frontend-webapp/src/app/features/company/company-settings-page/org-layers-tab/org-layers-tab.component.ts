import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CompanyStore } from '../../company.store';
import type { TCompanyId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-org-layers-tab',
  standalone: true,
  templateUrl: './org-layers-tab.component.html',
  styleUrl: './org-layers-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgLayersTabComponent {
  private readonly store = inject(CompanyStore);

  readonly companyId = input.required<TCompanyId>();

  readonly editLayers = signal<string[]>([]);

  constructor() {
    effect(() => {
      const c = this.store.company();
      if (!c) return;
      this.editLayers.set([...(c.orgLayers ?? ['Department', 'Team', 'Sub-team'])]);
    });
  }

  onLayerInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
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
    this.store.updateCompanyInfo(this.companyId(), { orgLayers: layers } as any);
  }
}
