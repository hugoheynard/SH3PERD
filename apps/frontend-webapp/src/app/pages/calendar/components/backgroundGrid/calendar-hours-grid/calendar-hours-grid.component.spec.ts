import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarHoursGridComponent } from './calendar-hours-grid.component';

describe('CalendarHoursGridComponent', () => {
  let component: CalendarHoursGridComponent;
  let fixture: ComponentFixture<CalendarHoursGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarHoursGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarHoursGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
