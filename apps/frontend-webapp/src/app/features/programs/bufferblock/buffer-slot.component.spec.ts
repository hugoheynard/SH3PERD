import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BufferSlotComponent } from './buffer-slot.component';

describe('BufferblockComponent', () => {
  let component: BufferSlotComponent;
  let fixture: ComponentFixture<BufferSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BufferSlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BufferSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
