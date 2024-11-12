import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyEventAssignFormComponent } from './weekly-event-assign-form.component';

describe('WeeklyEventAssignFormComponent', () => {
  let component: WeeklyEventAssignFormComponent;
  let fixture: ComponentFixture<WeeklyEventAssignFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyEventAssignFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyEventAssignFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
