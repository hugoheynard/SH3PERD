import type { ControlValueAccessor } from '@angular/forms';

export abstract class BaseControlValueAccessor<T> implements ControlValueAccessor {
  private _value!: T;
  public disabled: boolean = false;

  protected onChange: (value: T) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: T): void {
    this.value = value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  set value(val: T) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
      this.onTouched();
    }
  }

  get value(): T {
    return this._value;
  };

}
