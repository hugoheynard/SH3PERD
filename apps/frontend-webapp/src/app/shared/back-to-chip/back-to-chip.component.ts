import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

/**
 * Floating "Back to ..." chip driven by `?returnTo=<url>&returnLabel=<text>`
 * query parameters on the current route. Rendered as a compact pill
 * anchored top-left of the host page, visible only when both params
 * are set.
 *
 * The side-panel navigation flow on show / playlist edit is the main
 * consumer: when the user opens a docked show panel, clicks "browse
 * music library" (or "browse playlists"), the side-panel sets these
 * params so the target page (music library / playlists) can render
 * this chip. One click returns to the origin URL with no param noise
 * (the params are not re-appended on the back navigation).
 *
 * Intentionally shared — any page that wants to honour the return
 * convention just drops `<app-back-to-chip />` at the top of its
 * template. No service, no global state, pure query-param driven.
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly qp = toSignal(this.route.queryParamMap, {
    initialValue: null,
  });

  readonly returnTo = computed(() => this.qp()?.get('returnTo') ?? null);
  readonly returnLabel = computed(
    () => this.qp()?.get('returnLabel') ?? 'previous',
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
