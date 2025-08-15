import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlTemplateTableComponent } from './pl-template-table.component';

describe('PlTemplateTableComponent', () => {
  let component: PlTemplateTableComponent;
  let fixture: ComponentFixture<PlTemplateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlTemplateTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlTemplateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
