import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanelSectionComponent } from './side-panel-section.component';

describe('SidePanelSectionComponent', () => {
  let component: SidePanelSectionComponent;
  let fixture: ComponentFixture<SidePanelSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePanelSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidePanelSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
