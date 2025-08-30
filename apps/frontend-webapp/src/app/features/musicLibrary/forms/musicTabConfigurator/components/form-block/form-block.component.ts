import { Component, HostBinding, Input } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-form-block',
  imports: [
    MatIcon,
    NgClass
],
  standalone: true,
  styleUrl: './form-block.component.scss',
  templateUrl: './form-block.component.html',
  host: {
    '[class.stagger]': 'true',
    '[class.disabled-block]': 'disabled',
    '[style.animation-delay]': 'animationDelay',
  }
})
export class FormBlockComponent {
  @Input() title: string = 'block title';
  @Input() disabled: boolean = true;
  @Input() asDialog: boolean = false;
  @Input() animationDelay: number = 0;

  @HostBinding('class.dialog') get isDialog(): boolean {
    return this.asDialog;
  }
}
