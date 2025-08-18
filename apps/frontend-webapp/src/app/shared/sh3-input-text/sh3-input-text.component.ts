import { Component, input } from '@angular/core';
import { NgIf } from '@angular/common';
import { SvgIconComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'sh3-input-text',
  imports: [
    NgIf,
    SvgIconComponent,
  ],
  templateUrl: './sh3-input-text.component.html',
  styleUrl: './sh3-input-text.component.scss',
  host: { '[attr.data-size]': 'size()' }
})
export class Sh3InputTextComponent {
  public readonly size = input<'small' | 'large'>('large');
}
