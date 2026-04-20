import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import type { TShowId } from '@sh3pherd/shared-types';
import { ShowDetailComponent } from '../show-detail/show-detail.component';

/**
 * Deep-linkable full-page host for a show. The side panel is the
 * everyday entry point (mounted via `LayoutService.setRightPanel`);
 * this page exists so `/app/shows/:id` URLs can be bookmarked and
 * shared. Both shells lean on `ShowDetailComponent` for the body.
 */
@Component({
  selector: 'app-show-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShowDetailComponent],
  template: `<app-show-detail [showId]="showId()" />`,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class ShowDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap);

  protected readonly showId = computed<TShowId | null>(() => {
    const v = this.paramMap()?.get('id');
    return v ? (v as TShowId) : null;
  });
}
