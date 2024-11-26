import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeMenuComponent } from './node-menu.component';

describe('NodeMenuComponent', () => {
  let component: NodeMenuComponent;
  let fixture: ComponentFixture<NodeMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
