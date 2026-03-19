import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSlotDragPreviewComponent } from './multi-slot-drag-preview.component';

describe('MultiSlotDragPreviewComponent', () => {
  let component: MultiSlotDragPreviewComponent;
  let fixture: ComponentFixture<MultiSlotDragPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSlotDragPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSlotDragPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
