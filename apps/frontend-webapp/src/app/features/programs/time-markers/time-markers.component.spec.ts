import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeMarkersComponent } from './time-markers.component';

describe('TimeMarkersComponent', () => {
  let component: TimeMarkersComponent;
  let fixture: ComponentFixture<TimeMarkersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeMarkersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeMarkersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
