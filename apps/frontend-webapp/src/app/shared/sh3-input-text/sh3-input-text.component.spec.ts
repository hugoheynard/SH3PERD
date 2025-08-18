import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sh3InputTextComponent } from './sh3-input-text.component';

describe('Sh3InputTextComponent', () => {
  let component: Sh3InputTextComponent;
  let fixture: ComponentFixture<Sh3InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sh3InputTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sh3InputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
