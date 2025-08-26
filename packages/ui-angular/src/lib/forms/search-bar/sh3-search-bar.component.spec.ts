import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh3SearchBarComponent } from './sh3-search-bar.component.js';

describe('Sh3InputTextComponent', () => {
  let component: Sh3SearchBarComponent;
  let fixture: ComponentFixture<Sh3SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sh3SearchBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sh3SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
