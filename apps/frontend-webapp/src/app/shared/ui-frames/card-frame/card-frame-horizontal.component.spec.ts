import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFrameHorizontalComponent } from './card-frame-horizontal.component';

describe('CardFrameComponent', () => {
  let component: CardFrameHorizontalComponent;
  let fixture: ComponentFixture<CardFrameHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFrameHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFrameHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
