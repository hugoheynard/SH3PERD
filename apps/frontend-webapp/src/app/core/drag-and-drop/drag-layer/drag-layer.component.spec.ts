import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragLayerComponent } from './drag-layer.component';

describe('DragLayerComponent', () => {
  let component: DragLayerComponent;
  let fixture: ComponentFixture<DragLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragLayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
