import { Injectable, signal, type WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: WritableSignal<'light' | 'dark'> = signal('dark');

  constructor() {
    this.setTheme('dark');
  }

  toggleTheme(): void {
    const next = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  };

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme();
  };
}
