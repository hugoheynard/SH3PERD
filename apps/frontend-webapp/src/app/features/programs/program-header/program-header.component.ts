import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-program-header',
  imports: [
    FormsModule,
  ],
  templateUrl: './program-header.component.html',
  styleUrl: './program-header.component.scss'
})
export class ProgramHeaderComponent {
  @Input() programName!: string;
  @Input() programStart!: string;
  @Input() programEnd!: string;

  @Output() programStartChange = new EventEmitter<string>();
  @Output() programEndChange = new EventEmitter<string>();
  @Output() programNameChange = new EventEmitter<string>();

  @Output() addRoom = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();


  isSaved = false;

  onSaveClick() {
    this.save.emit();

    this.isSaved = true;

    setTimeout(() => {
      this.isSaved = false;
    }, 2000);
  }


  // Mode can be 'manual' or 'assisted' switching between manual and assisted mode
  mode: 'manual' | 'assisted' = 'manual';

  @Output() modeChange = new EventEmitter<'manual' | 'assisted'>();

  setMode(newMode: 'manual' | 'assisted') {
    this.mode = newMode;
    this.modeChange.emit(newMode);
  }
}
