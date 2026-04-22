import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconComponent } from '../icon/icon.component';
import type { Sh3IconName } from '../icon/icon.registry';

export interface CrossPageNavLink {
  /** Icon registered in `icon.registry.ts`. */
  icon: Sh3IconName;
  /** Human-readable label — used for tooltip + aria-label. */
  label: string;
  /** Target URL. The button highlights when the current URL matches
   *  this prefix (or exact match), and clicking navigates there. */
  url: string;
}

/**
 * Cluster of forward-nav buttons + an optional back button, meant to
 * live in the header of a dockable side panel (show detail, playlist
 * detail, …) so the user can hop between related main-area pages
 * without losing the side-panel context.
 *
 * Behaviour:
 * - Each `link` renders as an icon button. The button lights up
 *   (`nav-btn--active`) when the current URL matches the link's target.
 * - A back button (`chevron-left`) appears when the current URL isn't
 *   the `originUrl` the panel captured at mount time, letting the
 *   user jump back to the page they were on when they opened the
 *   panel — no menu detour required.
 *
 * The component is URL-driven (reads `router.url` via `NavigationEnd`)
 * so it works regardless of mount depth relative to the router outlet
 * — side panels sit outside the outlet via `LayoutService`.
 */
@Component({
  selector: 'app-cross-page-nav',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cross-page-nav.component.html',
  styleUrl: './cross-page-nav.component.scss',
})
export class CrossPageNavComponent {
  /** Where the panel was opened from — target of the back button. */
  readonly originUrl = input.required<string>();
  /** Human name of the origin — used for the back button tooltip
   *  ("Back to Shows"). */
  readonly originLabel = input.required<string>();
  /** Cross-page destinations. Rendered left-to-right as icon buttons. */
  readonly links = input.required<CrossPageNavLink[]>();

  private readonly router = inject(Router);

  /** Tick on every navigation — dependency trigger for the url signal. */
  private readonly navEnd = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  /** Current URL without query string — query params don't change
   *  which page the user is on, only its state. */
  private readonly currentPath = computed(() => {
    this.navEnd();
    return stripQuery(this.router.url);
  });

  readonly showBack = computed(
    () => this.currentPath() !== stripQuery(this.originUrl()),
  );

  /** An active link is one whose target is the current URL exactly,
   *  or a prefix ending at a path boundary (`/app/shows/abc` matches
   *  link `/app/shows`). Keeps deep-links highlighting the right tab. */
  isActive(url: string): boolean {
    const current = this.currentPath();
    const target = stripQuery(url);
    return current === target || current.startsWith(target + '/');
  }

  goBack(): void {
    this.router.navigateByUrl(this.originUrl());
  }

  navigate(link: CrossPageNavLink): void {
    this.router.navigate([stripQuery(link.url)]);
  }
}

function stripQuery(url: string): string {
  const hashIdx = url.indexOf('?');
  return hashIdx === -1 ? url : url.slice(0, hashIdx);
}
