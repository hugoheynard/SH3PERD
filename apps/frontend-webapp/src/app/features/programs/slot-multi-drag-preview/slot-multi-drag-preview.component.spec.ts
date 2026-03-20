import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotMultiDragPreviewComponent } from './slot-multi-drag-preview.component';

describe('MultiSlotDragPreviewComponent', () => {
  let component: SlotMultiDragPreviewComponent;
  let fixture: ComponentFixture<SlotMultiDragPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotMultiDragPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotMultiDragPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
