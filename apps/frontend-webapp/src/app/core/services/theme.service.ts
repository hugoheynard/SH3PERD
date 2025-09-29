import { effect, inject, Injectable, signal, type WritableSignal } from '@angular/core';
import { UserContextService } from './user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly userCtx = inject(UserContextService);
  private currentTheme: WritableSignal<'light' | 'dark'> = signal('dark');

  constructor() {
    effect(() => {
      const theme = this.userCtx.userStrict.preferences.theme;
      theme ? this.setTheme(theme) : this.setTheme('dark');
    })

  }

  toggleTheme(): void {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    this.userCtx.updateUserPreferences({ theme: next });
  };

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme();
  };
}
