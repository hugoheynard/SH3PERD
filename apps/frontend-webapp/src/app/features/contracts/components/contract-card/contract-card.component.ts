import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../../../../shared/avatar/avatar.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import { BadgeComponent } from '../../../../shared/badge/badge.component';
import type { TContractDomainModel, TContractId } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [AvatarComponent, StatusBadgeComponent, BadgeComponent],
  templateUrl: './contract-card.component.html',
  styleUrl: './contract-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.highlight]': 'highlight()',
  },
})
export class ContractCardComponent {
  readonly contract = input.required<TContractDomainModel>();
  readonly highlight = input(false);
  readonly clicked = output<TContractId>();

  formatDate(date: Date | string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
