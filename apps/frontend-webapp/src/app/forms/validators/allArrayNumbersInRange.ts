import {AbstractControl, ValidatorFn} from '@angular/forms';

export function allArrayNumbersInRange(min: number, max: number): ValidatorFn {
  return (control: AbstractControl) => {
    const values: number[] = control.value;

    if (!Array.isArray(values)) return { notArray: true };

    const outOfRange = values.filter(v => v < min || v > max);
    return outOfRange.length > 0
      ? { outOfRangeValues: { min, max, invalidValues: outOfRange } }
      : null;
  };
}
