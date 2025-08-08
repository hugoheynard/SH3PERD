import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SVG_ICONS } from './SVG_ICONES';

/**
 * SvgIconComponent
 *
 * This component renders an SVG icon based on a provided `name` key,
 * which is matched against a predefined `SVG_ICONS` registry.
 *
 * The raw SVG string is sanitized using Angular's DomSanitizer to safely inject it into the DOM.
 *
 * ⚠️ Important:
 * This component does **not** apply any internal sizing (e.g. width or height).
 * Consumers of this component must apply sizing via CSS or HTML attributes externally.
 *
 * @example
 * <sh3-svg-icon [name]="'search'" class="w-4 h-4"></sh3-svg-icon>
 *
 * @input name - The key corresponding to the desired SVG in the registry (required).
 */
@Component({
  selector: 'sh3-svg-icon',
  imports: [],
  templateUrl: './svg-icon.component.html',
  standalone: true,
  styleUrl: './svg-icon.component.scss',
})
export class SvgIconComponent implements OnChanges{
  @Input({required: true}) set name(value: string) {
    const rawSvg: string = this.iconRegistry[value] ?? '';
    if (!rawSvg) {
      console.warn('Icône non trouvée pour:', value);
    }
    this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  }
  safeSvg: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {};

 iconRegistry: { [key: string]: string } = SVG_ICONS;

  ngOnChanges(): void {
    //const rawSvg = this.iconRegistry[this.name] ?? '';
    //this.safeSvg = this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  };
}
