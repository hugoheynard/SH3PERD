import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekTemplateComponent } from './week-template.component';

describe('WeekSettingsComponent', () => {
  let component: WeekTemplateComponent;
  let fixture: ComponentFixture<WeekTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
