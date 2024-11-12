import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavlistCompanyComponent } from './navlist-settings.component';

describe('NavlistCompanyComponent', () => {
  let component: NavlistCompanyComponent;
  let fixture: ComponentFixture<NavlistCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavlistCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavlistCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
