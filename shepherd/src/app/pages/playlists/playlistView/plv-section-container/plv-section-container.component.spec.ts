import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlvSectionContainerComponent } from './plv-section-container.component';

describe('PlvSectionContainerComponent', () => {
  let component: PlvSectionContainerComponent;
  let fixture: ComponentFixture<PlvSectionContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlvSectionContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlvSectionContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
