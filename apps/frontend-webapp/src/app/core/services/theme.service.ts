import { effect, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserContextService } from './user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly userCtx = inject(UserContextService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect(() => {
      if (this.isBrowser) {
        document.documentElement.setAttribute('data-theme', this.userCtx.theme());
      }
    });
  }

  toggleTheme(): void {
    const next = this.userCtx.theme() === 'dark' ? 'light' : 'dark';
    this.userCtx.setTheme(next);
  }

  getTheme(): 'light' | 'dark' {
    return this.userCtx.theme();
  }
}
