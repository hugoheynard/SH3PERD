import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../../../../shared/avatar/avatar.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';
import type { TCompanyCardViewModel } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [AvatarComponent, StatusBadgeComponent],
  templateUrl: './company-card.component.html',
  styleUrl: './company-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCardComponent {
  readonly company = input.required<TCompanyCardViewModel>();
  readonly clicked = output<string>();

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  }
}
