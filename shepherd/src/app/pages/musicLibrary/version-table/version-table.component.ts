import {ChangeDetectorRef, Component, inject, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FileManagementComponent} from '../file-management/file-management.component';

@Component({
  selector: 'app-version-table',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgIf,
    MatIcon,
    MatIconButton,
    FileManagementComponent
  ],
  templateUrl: './version-table.component.html',
  styleUrl: './version-table.component.scss'
})
export class VersionTableComponent implements OnInit{
  @Input() versions: any[] = [];
  forms: FormGroup[] = [];

  private fb: FormBuilder = inject(FormBuilder);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)

  ngOnInit() {
    this.forms = this.versions.map(version =>
      this.fb.group({
        type: [version.type || ''],
        genre: [version.genre || ''],
        energy: [version.energy || ''],
        effort: [version.effort || ''],
        emergency: [version.emergency || false],
        pitch: [version.pitch || 0],
      })
    );
    //this.cdr.detectChanges(); //TODO usefull?
  };

  onSubmit(index: number) {
    const formData = this.forms[index].value;
    console.log(`Line ${index} form submitted :`, formData);
  };

  expandedIndex: number | null = null; // Index de la ligne en cours d'édition


  toggleFileUpload(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  };
}
