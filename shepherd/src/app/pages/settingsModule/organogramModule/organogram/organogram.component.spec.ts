import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganogramComponent } from './organogram.component';

describe('OrganogramComponent', () => {
  let component: OrganogramComponent;
  let fixture: ComponentFixture<OrganogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganogramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
