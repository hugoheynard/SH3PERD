import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarComponent } from '../../../../shared/avatar/avatar.component';
import { StatusBadgeComponent } from '../../../../shared/status-badge/status-badge.component';

@Component({
  selector: 'app-company-header',
  standalone: true,
  imports: [AvatarComponent, StatusBadgeComponent],
  templateUrl: './company-header.component.html',
  styleUrl: './company-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyHeaderComponent {
  readonly name = input.required<string>();
  readonly companyId = input.required<string>();
  readonly status = input.required<string>();
  readonly nodeCount = input(0);
  readonly contractCount = input(0);
}
