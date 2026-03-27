import { Component, input, output } from '@angular/core';

@Component({
  selector: 'sh3-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: {
    '[class]': 'variant() + " " + size()',
  },
})
/**
 * Shared button component — design system entry point for all actionable buttons.
 *
 * Uses content projection for the label (text, icons, or both).
 * Variant and size are applied as host classes (`:host(.primary.sm)`).
 *
 * @selector `sh3-button`
 *
 * @example
 * ```html
 * <!-- Primary (default) -->
 * <sh3-button (clicked)="save()">Save</sh3-button>
 *
 * <!-- Ghost cancel, small -->
 * <sh3-button variant="ghost" size="sm" (clicked)="cancel()">Cancel</sh3-button>
 *
 * <!-- Recommended action with icon -->
 * <sh3-button variant="recommended" size="sm" (clicked)="add()">+ Add a version</sh3-button>
 *
 * <!-- Critical / destructive -->
 * <sh3-button variant="critical" (clicked)="delete()">Delete</sh3-button>
 *
 * <!-- Disabled -->
 * <sh3-button [disabled]="!form.valid" (clicked)="submit()">Submit</sh3-button>
 * ```
 */
export class ButtonComponent {
  /**
   * Visual style of the button.
   * - `primary` — accent teal, default actions
   * - `recommended` — amber/warning, suggested actions
   * - `critical` — red/alert, destructive or urgent actions
   * - `ghost` — neutral/transparent, secondary or cancel actions
   * - `solid` — filled accent background, high-emphasis CTAs
   * @default 'primary'
   */
  readonly variant = input<'primary' | 'recommended' | 'critical' | 'ghost' | 'solid'>('primary');

  /**
   * Size preset controlling font-size, padding and border-radius.
   * - `sm` — compact (text-sm, tight padding)
   * - `md` — standard (text-md)
   * - `lg` — large (text-md, generous padding)
   * @default 'md'
   */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Native `type` attribute of the inner `<button>`.
   * @default 'button'
   */
  readonly type = input<'button' | 'submit'>('button');

  /**
   * Whether the button is disabled. Applies `opacity: 0.4` and blocks pointer events.
   * @default false
   */
  readonly disabled = input(false);

  /** Emitted on click (passes the native MouseEvent). */
  readonly clicked = output<MouseEvent>();
}
