import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'workspace-contract-widget',
  imports: [
    NgClass
],
  templateUrl: './workspace-contract-widget.component.html',
  standalone: true,
  styleUrl: './workspace-contract-widget.component.scss',
})
export class WorkspaceContractWidgetComponent {
  @Input() contractName: string = 'La Folie Douce Les Arcs';
  @Input() clientName?: string;
  @Input() startDate: string = '2024-01-01';
  @Input() endDate: string = '2026-01-01'

  status: 'Actif' | 'Expiré' = 'Actif'

  ngOnInit(): void {
    const now = new Date()
    const end = new Date(this.endDate)
    this.status = now <= end ? 'Actif' : 'Expiré'
  }
}
