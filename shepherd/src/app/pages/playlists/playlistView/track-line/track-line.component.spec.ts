import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackLineComponent } from './track-line.component';

describe('TrackLineComponent', () => {
  let component: TrackLineComponent;
  let fixture: ComponentFixture<TrackLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
