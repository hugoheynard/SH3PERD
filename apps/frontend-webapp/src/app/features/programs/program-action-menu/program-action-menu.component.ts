import { Component, inject, output } from '@angular/core';
import { ProgramStateService } from '../services/program-state.service';
import { RoomService } from '../services/planner-state-mutations/room.service';

@Component({
  selector: 'app-program-action-menu',
  imports: [],
  templateUrl: './program-action-menu.component.html',
  styleUrl: './program-action-menu.component.scss'
})
export class ProgramActionMenuComponent {
  state = inject(ProgramStateService);
  roomServ = inject(RoomService);

  save = output<void>();
  exportPdf = output<void>();

  isSaved = false;

  onSaveClick() {
    this.save.emit();

    this.isSaved = true;

    setTimeout(() => {
      this.isSaved = false;
    }, 2000);
  }
}
