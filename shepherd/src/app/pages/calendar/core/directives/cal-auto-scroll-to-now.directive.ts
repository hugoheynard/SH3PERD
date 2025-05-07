import {
  Directive,
  ElementRef,
  AfterViewInit,
  inject, Input
} from '@angular/core';


/**
 * Directive: appAutoScrollToNow
 *
 * Automatically scrolls a vertical container to center the current time
 * within a time-based grid (e.g., a calendar with 5-minute slots).
 *
 * It waits for the container to render with a minimum height before performing
 * the scroll, making it reliable with dynamic layouts, Angular hydration, or lazy content.
 *
 * Optionally, a custom scroll speed (duration in ms) can be configured via the `@Input() speed`.
 *
 * Example usage:
 * ```html
 * <div class="scroll-wrapper" appAutoScrollToNow [speed]="150">
 *   <div class="calendar-scroll-container"> ... </div>
 * </div>
 * ```
 *
 * @directive
 * @export
 */
@Directive({
  selector: '[appAutoScrollToNow]',
  standalone: true
})
export class AutoScrollToNowDirective implements AfterViewInit {
  private el: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private hasScrolled: boolean = false;
  /**
   * Scroll animation speed in milliseconds.
   * Defaults to 200ms.
   */
  @Input() speed: number = 200;

  ngAfterViewInit(): void {
    this.waitForContainerAndScroll();
  };

  private waitForContainerAndScroll(retries = 20): void {
    const container: HTMLElement = this.el.nativeElement;
    const ready: boolean = container.scrollHeight > 1000;

    if (this.hasScrolled || !ready) {
      if (!this.hasScrolled && retries > 0) {
        setTimeout(() => this.waitForContainerAndScroll(retries - 1), 50);
      }
      return;
    }

    this.hasScrolled = true;

    const now = new Date();
    const minutes: number = now.getHours() * 60 + now.getMinutes();
    const rowIndex: number = Math.floor(minutes / 5); // 288 rows = 24h * 12
    const rowHeight: number = 15;
    const offset : number = container.clientHeight / 2;
    const targetScrollTop: number = rowIndex * rowHeight - offset;

    this.scrollSmoothTo(container, targetScrollTop, this.speed); // custom speed
  };

  private scrollSmoothTo(container: HTMLElement, target: number, duration: number = 200): void {
    const start: number = container.scrollTop;
    const change: number = target - start;
    const startTime: number = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed: number = currentTime - startTime;
      const progress: number = Math.min(elapsed / duration, 1);

      container.scrollTop = start + change * progress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };
}
