import {AbstractControl, FormGroup} from '@angular/forms';

function isFormGroup(control: AbstractControl): control is FormGroup {
  return control instanceof FormGroup;
}

export function deepPatchForm<T>(
  formGroup: FormGroup,
  values: Partial<T>,
  emitEvent: boolean = false
): void {
  Object.keys(formGroup.controls).forEach((key: string): void => {
    const control = formGroup.get(key);
    const newValue = values?.[key as keyof T];

    if (!control) {
      return
    }

    if (isFormGroup(control) && typeof newValue === 'object' && newValue !== null) {
      // 🧠 Recursive patch for nested group
      deepPatchForm(control, newValue as Partial<T[keyof T]>, emitEvent);
    } else {
      // 🧪 Simple value patch
      if (newValue !== undefined) {
        control.setValue(newValue, { emitEvent });
      }
    }
  });
}
