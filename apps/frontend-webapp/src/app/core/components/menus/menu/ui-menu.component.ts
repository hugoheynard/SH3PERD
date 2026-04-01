import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgIconComponent } from '../../../../legacy/ui';

export interface UiMenuItem {
  id: string
  label?: string
  icon: string
  route?: string
  disabled?: boolean
}

@Component({
  selector: 'ui-menu',
  imports: [
    RouterLinkActive,
    RouterLink,
    SvgIconComponent
],
  templateUrl: './ui-menu.component.html',
  styleUrl: './ui-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiMenuComponent {
  items = input.required<UiMenuItem[]>();

  command = output<UiMenuItem>();

  onCommand(item: UiMenuItem) {

    this.command.emit(item);

  }
}
