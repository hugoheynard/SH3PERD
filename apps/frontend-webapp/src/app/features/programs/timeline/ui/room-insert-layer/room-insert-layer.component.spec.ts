import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomInsertLayerComponent } from './room-insert-layer.component';

describe('RoomInsertLayerComponent', () => {
  let component: RoomInsertLayerComponent;
  let fixture: ComponentFixture<RoomInsertLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomInsertLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomInsertLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
