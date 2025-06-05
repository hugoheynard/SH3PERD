import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSaveIconComponent } from './edit-save-icon.component';

describe('EditSaveIconComponent', () => {
  let component: EditSaveIconComponent;
  let fixture: ComponentFixture<EditSaveIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSaveIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSaveIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
