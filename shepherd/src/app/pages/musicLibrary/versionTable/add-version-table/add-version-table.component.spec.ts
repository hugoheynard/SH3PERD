import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVersionTableComponent } from './add-version-table.component';

describe('AddVersionTableComponent', () => {
  let component: AddVersionTableComponent;
  let fixture: ComponentFixture<AddVersionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVersionTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVersionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
