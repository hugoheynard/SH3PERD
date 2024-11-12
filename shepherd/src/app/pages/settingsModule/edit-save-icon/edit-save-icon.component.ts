import {Component, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-edit-save-icon',
  standalone: true,
    imports: [
        MatIcon
    ],
  templateUrl: './edit-save-icon.component.html',
  styleUrl: './edit-save-icon.component.scss'
})
export class EditSaveIconComponent {
  @Input() isModified: boolean = false;

}
