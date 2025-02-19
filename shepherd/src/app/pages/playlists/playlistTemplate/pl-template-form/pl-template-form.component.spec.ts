import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlTemplateFormComponent } from './pl-template-form.component';

describe('PlTemplateFormComponent', () => {
  let component: PlTemplateFormComponent;
  let fixture: ComponentFixture<PlTemplateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlTemplateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
