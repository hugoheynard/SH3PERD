import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceContractWidgetComponent } from './workspace-contract-widget.component';

describe('WorkspaceContractWidgetComponent', () => {
  let component: WorkspaceContractWidgetComponent;
  let fixture: ComponentFixture<WorkspaceContractWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceContractWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceContractWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
