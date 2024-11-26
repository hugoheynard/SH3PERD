import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeEditModuleComponent } from './node-edit-module.component';

describe('NodeEditModuleComponent', () => {
  let component: NodeEditModuleComponent;
  let fixture: ComponentFixture<NodeEditModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeEditModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeEditModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
