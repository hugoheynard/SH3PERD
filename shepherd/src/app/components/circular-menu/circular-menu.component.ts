import {ChangeDetectorRef, Component, effect, inject, Input, signal} from '@angular/core';
import { Router } from '@angular/router';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {fromEvent, map, startWith} from 'rxjs';

interface MenuItem {
  label: string;
  route: string;
  iconName?: string;
}

@Component({
  selector: 'app-circular-menu',
  templateUrl: './circular-menu.component.html',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    MatIcon,
    NgStyle
  ],
  styleUrls: ['./circular-menu.component.scss']
})
export class CircularMenuComponent {
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  public isOpen = signal(false);
  @Input() menuItems: MenuItem[] = [];

  constructor() {
    effect((): void => {
      if (this.isOpen()) {
        this.cdr.markForCheck();
      }
    });
  };

  toggle(): void {
    this.isOpen.update(v => !v);
  };

  open(): void {
    this.isOpen.set(true);
  };

  close(): void {
    this.isOpen.set(false);
  };

  navigate(route: string): void {
    // this.router.navigate([route]);
    this.close();
  };
}
