import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPerformanceSlotPopoverComponent } from './edit-performance-slot-popover.component';

describe('EditPerformanceSlotPopoverComponent', () => {
  let component: EditPerformanceSlotPopoverComponent;
  let fixture: ComponentFixture<EditPerformanceSlotPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPerformanceSlotPopoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPerformanceSlotPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
