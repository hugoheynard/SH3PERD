import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-icon-flat-button',
  standalone: true,
  imports: [],
  templateUrl: './icon-flat-button.component.html',
  styleUrl: './icon-flat-button.component.scss'
})
export class IconFlatButtonComponent {

  @Input() iconName: string = '';
  @Input() action: () => any = () => {};

  handleClick() {
    this.action()
  };
}
