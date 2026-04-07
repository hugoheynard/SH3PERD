import { effect, inject, Injectable } from '@angular/core';
import { UserContextService } from './user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly userCtx = inject(UserContextService);

  constructor() {
    // React to theme changes (initial load + user toggles)
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.userCtx.theme());
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
