import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerCalendarComponent } from './date-picker-calendar.component';

describe('DatePickerCalendarComponent', () => {
  let component: DatePickerCalendarComponent;
  let fixture: ComponentFixture<DatePickerCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatePickerCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
