import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-node-actions',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    FormsModule,
    NgIf
  ],
  templateUrl: './node-actions.component.html',
  styleUrl: './node-actions.component.scss'
})
export class NodeActionsComponent {
  @Input() isAddingChild = false;
  @Input() newChildValue = '';
  @Output() onAdd = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();
}
