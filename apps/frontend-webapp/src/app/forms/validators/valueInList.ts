import { AbstractControl, type ValidatorFn } from '@angular/forms';

export function valueInList(allowedValues: any[]): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;

    if (Array.isArray(value)) {
      const invalidValues = value.filter(v => !allowedValues.includes(v));
      return invalidValues.length > 0
        ? { invalidValues, allowedValues }
        : null;
    }

    return allowedValues.includes(value)
      ? null
      : { invalidValue: value, allowedValues };
  };
}

