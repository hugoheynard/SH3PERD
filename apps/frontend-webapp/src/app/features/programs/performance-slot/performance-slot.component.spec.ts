import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceSlotComponent } from './performance-slot.component';

describe('PerformanceSlotComponent', () => {
  let component: PerformanceSlotComponent;
  let fixture: ComponentFixture<PerformanceSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceSlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
