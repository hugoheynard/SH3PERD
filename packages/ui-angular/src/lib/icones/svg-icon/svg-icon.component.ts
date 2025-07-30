import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SVG_ICONS } from './SVG_ICONES';

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
