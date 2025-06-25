import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandMoreLessButtonComponent } from './expand-more-less-button.component';

describe('ExpandMoreLessButtonComponent', () => {
  let component: ExpandMoreLessButtonComponent;
  let fixture: ComponentFixture<ExpandMoreLessButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandMoreLessButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandMoreLessButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
