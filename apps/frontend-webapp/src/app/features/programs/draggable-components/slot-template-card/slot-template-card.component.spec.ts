import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotTemplateCardComponent } from './slot-template-card.component';

describe('SlotTemplateCardComponent', () => {
  let component: SlotTemplateCardComponent;
  let fixture: ComponentFixture<SlotTemplateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotTemplateCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotTemplateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
