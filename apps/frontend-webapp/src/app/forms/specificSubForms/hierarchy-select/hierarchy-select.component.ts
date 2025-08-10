import { type AfterViewInit, Component, EventEmitter, Input, type OnInit, Output} from '@angular/core';
import {SelectCheckboxComponent} from "../../select-checkbox/select-checkbox.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-hierarchy-select',
    imports: [SelectCheckboxComponent, ReactiveFormsModule, NgIf],
    templateUrl: './hierarchy-select.component.html',
    standalone: true,
    styleUrl: './hierarchy-select.component.scss'
})
export class HierarchySelectComponent implements OnInit, AfterViewInit{

  @Input() formGroup?: any;
  @Output() formSubmit = new EventEmitter<FormGroup>();

  services: FormControl = new FormControl('', Validators.required);
  categories: FormControl = new FormControl({ value: '', disabled: false });

  ngOnInit() {
    if (!this.formGroup) {
      this.formGroup = new FormGroup({});
    }
    this.addControlsToFormGroup();

  }

  ngAfterViewInit() {
    // Subscribe to the valueChanges after the component's view is initialized
    this.subscribeToServicesChanges();

    if (this.services.value === '') {
      this.services.setValue('artistic'); // Set value here to trigger valueChanges
    }
  }

  private addControlsToFormGroup() {
    this.formGroup.addControl('services', this.services);
    this.formGroup.addControl('categories', this.categories);
  }


  private subscribeToServicesChanges() {
    // Type the value in valueChanges as a string (or use a more specific type if necessary)
    this.services.valueChanges.subscribe((value: any) => {
      console.log(value)
      if (value === 'artistic') {

        this.categories.enable();
      } else {
        this.categories.reset();
        this.categories.disable();
        this.categories.clearValidators();
      }
      this.categories.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.formGroup && this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      console.log("Form is invalid");
      // Optional: emit error message or event
    }
  }


}
