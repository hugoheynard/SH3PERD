import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotPlannerComponent } from './slot-planner.component';

describe('PerformanceSlotComponent', () => {
  let component: SlotPlannerComponent;
  let fixture: ComponentFixture<SlotPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotPlannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
