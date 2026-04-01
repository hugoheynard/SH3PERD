import { Component, input } from '@angular/core';
import { NgIf } from '@angular/common';
import { SvgIconComponent } from '../../icones';

@Component({
  selector: 'sh3-search-bar',
  imports: [
    NgIf,
    SvgIconComponent,
  ],
  standalone: true,
  templateUrl: './sh3-search-bar.component.html',
  styleUrl: './sh3-search-bar.component.scss',
  host: { '[attr.data-size]': 'size()' }
})
export class Sh3SearchBarComponent {
  public readonly size = input<'small' | 'large'>('large');
}
