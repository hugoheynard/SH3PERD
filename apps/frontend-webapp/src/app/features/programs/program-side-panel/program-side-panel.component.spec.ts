import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramSidePanelComponent } from './program-side-panel.component';

describe('ProgramSidePanelComponent', () => {
  let component: ProgramSidePanelComponent;
  let fixture: ComponentFixture<ProgramSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramSidePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
