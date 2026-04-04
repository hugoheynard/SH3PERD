import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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

  /** First letters of the first two words (e.g. "Acme Productions" → "AP") */
  readonly initials = computed(() => {
    const words = this.name().trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return this.name().substring(0, 2).toUpperCase();
  });
}
