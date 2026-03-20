import { Component, inject, output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramActionMenuComponent } from '../program-action-menu/program-action-menu.component';
import { PlannerSelectorService } from '../services/selector-layer/planner-selector.service';
import { ProgramSettingsService } from '../services/mutations-layer/program-settings.service';
import { ProgramHistoryService } from '../services/program-history.service';

@Component({
  selector: 'app-program-header',
  imports: [
    FormsModule,
    ProgramActionMenuComponent,
  ],
  templateUrl: './program-header.component.html',
  styleUrl: './program-header.component.scss'
})
export class ProgramHeaderComponent {

  selector = inject(PlannerSelectorService);
  settings = inject(ProgramSettingsService);
  private history = inject(ProgramHistoryService);



  name = this.selector.name;
  startTime = this.selector.startTime;
  endTime = this.selector.endTime;

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


  undo() {
    this.history.undo();
  };

  redo() {
    this.history.redo();
  };

  canUndo() {
    return this.history.canUndo();
  };

  canRedo() {
    return this.history.canRedo();
  };
}
