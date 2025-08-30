import { Component, Input, numberAttribute } from '@angular/core';
import { SvgIconComponent } from '@sh3pherd/ui-angular';


@Component({
  selector: 'stat-card',
  imports: [
    SvgIconComponent
],
  templateUrl: './stat-card.component.html',
  standalone: true,
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() iconName: string = '';
  @Input({ transform: numberAttribute }) maxValue: number = 100;
  @Input({ transform: numberAttribute }) value: number = 0;
  @Input() valueSuffix: string = '';
  @Input() progressBar: boolean = true;

  getProgressBar(): number {
    const percent = (this.value * 100) / this.maxValue;
    return Math.min(Math.max(percent, 0), 100);
  };

  getValue(): string {
    return `${this.value}${this.valueSuffix}`;
  }
}
