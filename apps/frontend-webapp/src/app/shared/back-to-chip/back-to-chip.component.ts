import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconComponent } from '../icon/icon.component';

/**
 * "Back to ..." chip driven by `?returnTo=<url>&returnLabel=<text>`
 * query parameters on the current URL. Renders a compact pill
 * (`← Back to Shows`) only when both params are set; otherwise the
 * host slot stays empty.
 *
 * The side-panel navigation flow on show / playlist edit is the main
 * consumer: when the user opens a docked show panel, clicks "browse
 * music library" (or "browse playlists"), the side-panel sets these
 * params so the target page can render this chip. One click returns
 * to the origin URL with no param noise (the params are not
 * re-appended on the back navigation).
 *
 * Reads query params via `Router` directly rather than
 * `ActivatedRoute.queryParamMap`. That's intentional — this chip is
 * mounted in the app shell header which lives *outside* the
 * `<router-outlet>`, so `ActivatedRoute` resolves to the root route
 * whose `queryParamMap` doesn't refresh when child routes navigate.
 * Subscribing to `NavigationEnd` + re-parsing `router.url` gives us
 * the correct params regardless of where the component is mounted.
 */
@Component({
  selector: 'app-back-to-chip',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './back-to-chip.component.html',
  styleUrl: './back-to-chip.component.scss',
})
export class BackToChipComponent {
  private readonly router = inject(Router);

  /** Tick on every navigation — purely a dependency trigger for the
   *  `queryParams` computed below. The value itself isn't read. */
  private readonly navEnd = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
    { initialValue: null },
  );

  private readonly queryParams = computed(() => {
    this.navEnd();
    return this.router.parseUrl(this.router.url).queryParamMap;
  });

  readonly returnTo = computed(() => this.queryParams().get('returnTo'));
  readonly returnLabel = computed(
    () => this.queryParams().get('returnLabel') ?? 'previous',
  );

  navigateBack(): void {
    const url = this.returnTo();
    if (!url) return;
    // `navigateByUrl` replaces the entire URL including query string,
    // so the returnTo / returnLabel params don't trail the user after
    // they go back — only the stored URL survives.
    this.router.navigateByUrl(url);
  }
}
