import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragIconComponent } from './drag-icon.component';

describe('DragIconComponent', () => {
  let component: DragIconComponent;
  let fixture: ComponentFixture<DragIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
