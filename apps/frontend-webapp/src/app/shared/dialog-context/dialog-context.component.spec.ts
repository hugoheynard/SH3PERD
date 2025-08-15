import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogContextComponent } from './dialog-context.component';

describe('DialogContextComponent', () => {
  let component: DialogContextComponent;
  let fixture: ComponentFixture<DialogContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogContextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
