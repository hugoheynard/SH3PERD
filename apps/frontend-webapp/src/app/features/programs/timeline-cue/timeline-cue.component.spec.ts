import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineCueComponent } from './timeline-cue.component';

describe('TimelineCueComponent', () => {
  let component: TimelineCueComponent;
  let fixture: ComponentFixture<TimelineCueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineCueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineCueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
