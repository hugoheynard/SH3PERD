import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramActionMenuComponent } from './program-action-menu.component';

describe('ProgramActionMenuComponent', () => {
  let component: ProgramActionMenuComponent;
  let fixture: ComponentFixture<ProgramActionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramActionMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramActionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
