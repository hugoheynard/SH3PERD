import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from '../../icones';


@Component({
  selector: 'sh3-button-icon',
  imports: [
    SvgIconComponent,
  ],
  templateUrl: './button-icon.component.html',
  styleUrl: './button-icon.component.scss'
})
export class ButtonIconComponent {
  @Input({ required: true }) icon: string = '';
  @Input() active: boolean = false;
  @Input() disabled: boolean = false;
  @Input() type: 'primary' | 'critical' = 'primary';
  @Output() clicked = new EventEmitter<void>();


  onClick(): void {
    if (this.disabled) {
      return;
    }
    this.clicked.emit();
    this.active = !this.active;
    return;
  };
}
