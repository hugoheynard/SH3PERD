import { Component, HostBinding, Input } from '@angular/core';
import { SvgIconComponent } from '../../icones';
import { NgIf } from '@angular/common';

/**
 * Reusable tag (label) component with optional text, icon, and visual style variants.
 *
 * @example
 * // Tag with text only
 * <sh3-tag text="New" variant="primary"></sh3-tag>
 *
 * @example
 * // Tag with icon and grey style
 * <sh3-tag text="3 new" icon="clock" variant="fadedGrey"></sh3-tag>
 *
 * @example
 * // Secondary tag with custom icon
 * <sh3-tag text="Important" icon="lightning" variant="secondary"></sh3-tag>
 *
 * @remarks
 * - The color and visual style are determined by the `variant` property
 *   and applied via a `data-variant` attribute on the host element.
 * - The icon is rendered using `SvgIconComponent` and automatically scales with the text size.
 * - CSS variables `--tag-bg`, `--tag-fg`, and `--tag-border` can be overridden externally
 *   to customize the appearance.
 * - Styles are encapsulated in the component but can be influenced using CSS variables
 *   or classes applied to the host element.
 *
 * @property text - The text content displayed inside the tag.
 * @property icon - The name of the SVG icon to display (referenced in `SvgIconComponent`).
 * @property variant - The visual style variant of the tag (`'primary' | 'secondary' | 'lightGrey' | 'fadedGrey'`).
 */
@Component({
  selector: 'sh3-tag',
  imports: [
    SvgIconComponent,
    NgIf,
  ],
  templateUrl: './tag.component.html',
  standalone: true,
  styleUrl: './tag.component.scss',
})
export class TagComponent {
  @Input() text: string | number | null= '';
  @Input() icon: string = '';
  @Input() variant: 'primary' | 'secondary' | 'lightGrey' | 'fadedGrey' | 'alert' | 'warning' = 'primary';
  @HostBinding('attr.data-variant') get dataVariant() {
    return this.variant;
  };
}
