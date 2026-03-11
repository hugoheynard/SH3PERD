import { Component, inject, output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProgramStateService } from '../services/program-state.service';
import { ProgramActionMenuComponent } from '../program-action-menu/program-action-menu.component';
import { PlannerSelectorService } from '../services/planner-selector.service';

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

  state = inject(ProgramStateService);
  selector = inject(PlannerSelectorService);

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
