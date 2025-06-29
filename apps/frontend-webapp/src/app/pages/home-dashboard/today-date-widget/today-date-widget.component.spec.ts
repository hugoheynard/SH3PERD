import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayDateWidgetComponent } from './today-date-widget.component';

describe('TodayDateWidgetComponent', () => {
  let component: TodayDateWidgetComponent;
  let fixture: ComponentFixture<TodayDateWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodayDateWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodayDateWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
