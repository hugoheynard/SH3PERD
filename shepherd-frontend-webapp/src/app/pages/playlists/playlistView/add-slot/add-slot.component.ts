import {Component, EventEmitter, Output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';


@Component({
  selector: 'add-slot-button',
  imports: [
    MatIcon,
    MatIconButton
  ],
  templateUrl: './add-slot.component.html',
  standalone: true,
  styleUrl: './add-slot.component.scss'
})
export class AddSlotComponent {
  @Output() addEmptySlotTrigger: EventEmitter<void> = new EventEmitter<void>() ;

  addEmptySlot(): void {
    this.addEmptySlotTrigger.emit();
  };
}
