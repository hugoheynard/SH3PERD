import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaySettingsCabaretFormComponent } from './day-settings-cabaret-form.component';

describe('DaySettingsCabaretFormComponent', () => {
  let component: DaySettingsCabaretFormComponent;
  let fixture: ComponentFixture<DaySettingsCabaretFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DaySettingsCabaretFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DaySettingsCabaretFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
