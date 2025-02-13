import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlvSectionHeaderComponent } from './plv-section-header.component';

describe('PlvSectionHeaderComponent', () => {
  let component: PlvSectionHeaderComponent;
  let fixture: ComponentFixture<PlvSectionHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlvSectionHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlvSectionHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
