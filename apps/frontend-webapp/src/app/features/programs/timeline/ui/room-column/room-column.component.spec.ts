import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomColumnComponent } from './room-column.component';

describe('RoomColumnComponent', () => {
  let component: RoomColumnComponent;
  let fixture: ComponentFixture<RoomColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
