import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverFrameComponent } from './popover-frame.component';

describe('PopoverFrameComponent', () => {
  let component: PopoverFrameComponent;
  let fixture: ComponentFixture<PopoverFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverFrameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopoverFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
