import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectParticipantsComponent } from './select-participants.component';

describe('SelectParticipantsComponent', () => {
  let component: SelectParticipantsComponent;
  let fixture: ComponentFixture<SelectParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectParticipantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
