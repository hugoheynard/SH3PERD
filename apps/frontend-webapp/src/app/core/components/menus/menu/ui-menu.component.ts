import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../../../shared/icon/icon.component';
import type { Sh3IconName } from '../../../../shared/icon/icon.registry';

export interface UiMenuItem {
  id: string
  label?: string
  icon: Sh3IconName
  route?: string
  disabled?: boolean
}

@Component({
  selector: 'ui-menu',
  imports: [
    RouterLinkActive,
    RouterLink,
    IconComponent
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
