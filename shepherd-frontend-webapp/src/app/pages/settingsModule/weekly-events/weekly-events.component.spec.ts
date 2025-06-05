import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyEventsComponent } from './weekly-events.component';

describe('WeeklyEventsComponent', () => {
  let component: WeeklyEventsComponent;
  let fixture: ComponentFixture<WeeklyEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
