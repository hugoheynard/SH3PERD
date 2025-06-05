import {Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton, MatFabButton} from '@angular/material/button';

@Component({
    selector: 'app-node-edit-module',
    imports: [
        MatFormField, MatInput, MatLabel, MatCheckbox, ReactiveFormsModule, MatSelect, MatOption, MatButton, MatFabButton, MatHint
    ],
    templateUrl: './node-edit-module.component.html',
    styleUrl: './node-edit-module.component.scss'
})
export class NodeEditModuleComponent {
  private fb = inject(FormBuilder);

  @Input() nodeToEdit: any = null;
  @Input() nodeAction: string | null = null;
  @Output() nodeData = new EventEmitter<any>();

  public nodeForm: FormGroup = this.fb.group({
    type: [''],
    name: [''],
    canHaveChildren: [true],
    color: this.fb.group({
      custom: ['#555555'],
      autoColorizeChildren: [false]
    })
  });

  ngOnChanges(changes: SimpleChanges): void {
    this.nodeForm.reset();

    if (changes['nodeToEdit'] && this.nodeToEdit) {
      if (this.nodeAction === 'edit') {
        this.nodeForm.patchValue(this.nodeToEdit.value);
      }
    }
  };

  onSubmit(): void {
    if (this.nodeForm.valid) {
      this.nodeData.emit(this.nodeForm.value);
      this.nodeForm.reset();
    }
  };
}
