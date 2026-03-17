import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotPreviewComponent } from './slot-preview.component';

describe('SlotPreviewComponent', () => {
  let component: SlotPreviewComponent;
  let fixture: ComponentFixture<SlotPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
