import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh3MenuComponent } from './sh3-menu.component';

describe('Sh3MenuComponent', () => {
  let component: Sh3MenuComponent;
  let fixture: ComponentFixture<Sh3MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sh3MenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sh3MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
