import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTemplatePopoverComponent } from './edit-template-popover.component';

describe('EditTemplatePopoverComponent', () => {
  let component: EditTemplatePopoverComponent;
  let fixture: ComponentFixture<EditTemplatePopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTemplatePopoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTemplatePopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
