import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-company-header',
  standalone: true,
  templateUrl: './company-header.component.html',
  styleUrl: './company-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyHeaderComponent {
  readonly name = input.required<string>();
  readonly status = input.required<string>();
  readonly nodeCount = input(0);
  readonly contractCount = input(0);

  readonly settingsClicked = output<void>();
}
