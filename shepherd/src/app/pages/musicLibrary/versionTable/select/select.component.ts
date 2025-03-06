import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
    selector: 'app-select',
    imports: [
        NgForOf,
        ReactiveFormsModule
    ],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input() control!: FormControl;
  @Input() options: string[] = [];
}
