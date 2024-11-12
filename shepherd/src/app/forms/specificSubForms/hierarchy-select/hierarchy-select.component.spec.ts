import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchySelectComponent } from './hierarchy-select.component';

describe('HierarchySelectComponent', () => {
  let component: HierarchySelectComponent;
  let fixture: ComponentFixture<HierarchySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchySelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HierarchySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
