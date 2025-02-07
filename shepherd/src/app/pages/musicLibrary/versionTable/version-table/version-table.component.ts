import {ChangeDetectorRef, Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FileManagementComponent} from '../file-management/file-management.component';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {SelectComponent} from '../select/select.component';
import {MusicLibraryService} from '../../../../services/music-library.service';

@Component({
  selector: 'app-version-table',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    NgIf,
    MatIcon,
    MatIconButton,
    FileManagementComponent,
    CdkDrag,
    SelectComponent
  ],
  templateUrl: './version-table.component.html',
  styleUrl: './version-table.component.scss'
})
export class VersionTableComponent implements OnInit, OnChanges{
  private mlServ = inject(MusicLibraryService);
  private fb: FormBuilder = inject(FormBuilder);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  public expandedIndex: number | null = null; // Index de la ligne en cours d'édition

  @Input() versions: any[] = [];
  forms: FormGroup[] = [];

  ngOnInit(): void {
    this.initializeForms();
    this.cdr.detectChanges();
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['versions'] && !changes['versions'].firstChange) {
      this.initializeForms();
    }
  };

  initializeForms(): void {
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
  };

  onSubmit(input:{ index: number, version_id: string }): void {
    const formData = this.forms[input.index].value;
    console.log(`Line ${input.index} form submitted :`, formData);
  };

  getControl(input: { formIndex: number, controlName: string }) {
    const control = this.forms[input.formIndex]?.get(input.controlName);
    return control as FormControl;
  };

  toggleFileUpload(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  };
}
