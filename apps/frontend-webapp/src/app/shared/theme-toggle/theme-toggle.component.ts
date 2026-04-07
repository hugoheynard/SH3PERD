import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { UserContextService } from '../../core/services/user-context.service';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Premium toggle switch for light/dark theme.
 *
 * Reads current theme from UserContextService, toggles via ThemeService.
 * Self-contained — just drop `<sh3-theme-toggle />` anywhere.
 *
 * @selector `sh3-theme-toggle`
 */
@Component({
  selector: 'sh3-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly userCtx = inject(UserContextService);
  private readonly themeService = inject(ThemeService);

  readonly isDark = computed(() => this.userCtx.theme() === 'dark');

  toggle(): void {
    this.themeService.toggleTheme();
  }
}
