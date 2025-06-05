import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'dark';

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    this.setTheme(saved ?? 'dark');
  }

  toggleTheme(): void {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  };

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  };
};
