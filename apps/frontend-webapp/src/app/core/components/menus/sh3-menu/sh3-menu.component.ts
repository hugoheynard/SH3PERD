import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SvgIconComponent } from '@sh3pherd/ui-angular';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string | any[];
  command?: string;
  exact?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'sh3-menu',
  imports: [
    NgIf,
    NgForOf,
    RouterLinkActive,
    RouterLink,
    SvgIconComponent,
  ],
  templateUrl: './sh3-menu.component.html',
  styleUrl: './sh3-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sh3MenuComponent {
  @Input({ required: true }) items: MenuItem[] = [];
  @Output() command = new EventEmitter<MenuItem>(); // ← émet les items "command"
  trackById = (_: number, it: MenuItem) => it.id;
}
