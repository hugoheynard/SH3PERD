import {ChangeDetectorRef, Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {FileManagementComponent} from '../file-management/file-management.component';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {SelectComponent} from '../select/select.component';
import {MusicRepertoireService} from '../../../../services/music-repertoire.service';

@Component({
    selector: 'app-version-table',
    imports: [
        NgForOf,
        ReactiveFormsModule,
        NgIf,
        MatIcon,
        MatIconButton,
        FileManagementComponent,
        CdkDrag,
        SelectComponent,
        NgTemplateOutlet
    ],
    templateUrl: './version-table.component.html',
    standalone: true,
    styleUrl: './version-table.component.scss'
})
export class VersionTableComponent implements OnInit, OnChanges{
  private mlServ = inject(MusicRepertoireService);
  private fb: FormBuilder = inject(FormBuilder);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)
  public expandedIndex: number | null = null; // Index de la ligne en cours d'édition

  @Input() referenceMusic_id: string = '';
  @Input() versions: any[] = [];
  @Input() addVersionTr: boolean = false;
  forms: FormGroup[] = [];
  newVersionForm: FormGroup = new FormGroup({});

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
    this.forms = this.versions.map(version => this.createVersionForm(version));
    this.newVersionForm = this.createVersionForm();
  };

  createVersionForm(version: any = {}): FormGroup {
    return this.fb.group({
      type: [version.type || ''],
      genre: [version.genre || ''],
      energy: [version.energy || ''],
      effort: [version.effort || ''],
      emergency: [version.emergency || false],
      pitch: [version.pitch || 0],
    });
  };

  addNewVersion(): void {
    if (this.newVersionForm.invalid) return;

    const newVersion = this.newVersionForm.value;
    console.log("Nouvelle version ajoutée :", newVersion);

    // Ajouter la version dans `versions` et générer un nouveau form
    this.versions.push(newVersion);
    this.forms.push(this.createVersionForm(newVersion));

    // Réinitialiser le formulaire
    this.newVersionForm.reset({
      type: '',
      genre: '',
      energy: '',
      effort: '',
      emergency: false,
      pitch: 0,
    });
  }

  async onSubmitUpdate(input:{ index: number, version_id: string }): Promise<void> {
    const formData = this.forms[input.index].value;

    const result = await this.mlServ.updateVersion({
      version_id: input.version_id,
      versionData: formData
    })
    console.log(`Line ${input.index} form submitted :`, result);
  };

  async onSubmitPostNew(input: { referenceMusic_id: string }): Promise<void> {
    const formData = this.newVersionForm.value;

    const result = await this.mlServ.postVersion({
      referenceMusic_id: input.referenceMusic_id,
      versionData: formData
    });
    console.log(`New version added :`, result);
    this.cdr.detectChanges();
  };

  async deleteVersion(input: { version_id: string }): Promise<void> {
    const result = this.mlServ.deleteVersion({ version_id: input.version_id });
    this.cdr.detectChanges();
  };

  getControl(input: { formIndex: number, controlName: string }) {
    const control = this.forms[input.formIndex]?.get(input.controlName);
    return control as FormControl;
  };

  toggleFileUpload(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  };
}
