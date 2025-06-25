import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconFlatButtonComponent } from './icon-flat-button.component';

describe('IconFlatButtonComponent', () => {
  let component: IconFlatButtonComponent;
  let fixture: ComponentFixture<IconFlatButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconFlatButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconFlatButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
