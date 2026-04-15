import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrgLayersTabStore } from './org-layers-tab.store';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { FormSectionComponent } from '../../../../shared/forms/form-section/form-section.component';
import type { TCompanyId } from '@sh3pherd/shared-types';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-org-layers-tab',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent, FormSectionComponent, IconComponent],
  providers: [OrgLayersTabStore],
  templateUrl: './org-layers-tab.component.html',
  styleUrl: './org-layers-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgLayersTabComponent implements OnInit {
  private readonly store = inject(OrgLayersTabStore);

  readonly companyId = input.required<TCompanyId>();
  readonly editLayers = signal<string[]>([]);
  readonly saving = this.store.saving;
  readonly loading = this.store.loading;

  private original = signal<string[]>([]);

  readonly dirty = computed(() => {
    const e = this.editLayers();
    const o = this.original();
    return e.length !== o.length || e.some((v, i) => v !== o[i]);
  });

  constructor() {
    effect(() => {
      const layers = this.store.orgLayers();
      if (!layers) return;
      this.editLayers.set([...layers]);
      this.original.set([...layers]);
    });
  }

  ngOnInit(): void {
    this.store.load(this.companyId());
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

  insertLayerAt(index: number): void {
    this.editLayers.update(layers => {
      const copy = [...layers];
      copy.splice(index, 0, '');
      return copy;
    });
  }

  removeLayer(index: number): void {
    this.editLayers.update(layers => layers.filter((_, i) => i !== index));
  }

  moveLayer(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.editLayers().length) return;
    this.editLayers.update(layers => {
      const copy = [...layers];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  }

  save(): void {
    if (!this.dirty() || this.saving()) return;
    const layers = this.editLayers().filter(l => l.trim());
    this.store.save(this.companyId(), layers);
  }
}
