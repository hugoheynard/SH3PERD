import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser'; // Required for querying DOM
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Helps avoid unknown elements errors

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<CheckboxComponent>;
  let component: CheckboxComponent;

  beforeEach(async () => {
    // Optional: inline templates and styles if needed (for Jest standalone)
    // await resolveComponentResources(CheckboxComponent);

    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Avoid errors from unknown tags if needed
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render with default label', () => {
    const labelEl = fixture.debugElement.query(By.css('.checkbox-label'));
    expect(labelEl.nativeElement.textContent).toContain('Check');
  });

  it('should render with custom label', () => {
    component.label = 'Accept Terms';
    fixture.detectChanges();
    const labelEl = fixture.debugElement.query(By.css('.checkbox-label'));
    expect(labelEl.nativeElement.textContent).toContain('Accept Terms');
  });

  it('should emit value when checkbox is clicked', () => {
    const input = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    input.nativeElement.checked = true;
    input.triggerEventHandler('change', { target: input.nativeElement });
    fixture.detectChanges();
    expect(component.value).toBe(true);
  });

  it('should work with FormControl (ReactiveForms)', () => {
    const control = new FormControl(false);
    component.registerOnChange(control.setValue.bind(control));
    component.registerOnTouched(() => {});
    component.writeValue(false);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    input.nativeElement.checked = true;
    input.triggerEventHandler('change', { target: input.nativeElement });
    fixture.detectChanges();

    expect(control.value).toBe(true);
  });
});
