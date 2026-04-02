import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sh3-form-section',
  standalone: true,
  template: `
    @if (title()) {
      <span class="section-title">{{ title() }}</span>
    }
    <div class="section-body">
      <ng-content />
    </div>
  `,
  styleUrl: './form-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionComponent {
  readonly title = input<string>();
}
