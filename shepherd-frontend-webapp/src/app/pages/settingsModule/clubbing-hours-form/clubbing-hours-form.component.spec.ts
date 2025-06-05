import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubbingHoursFormComponent } from './clubbing-hours-form.component';

describe('ClubbingHoursFormComponent', () => {
  let component: ClubbingHoursFormComponent;
  let fixture: ComponentFixture<ClubbingHoursFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubbingHoursFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClubbingHoursFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
