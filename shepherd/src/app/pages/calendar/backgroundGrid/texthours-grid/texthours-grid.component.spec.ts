import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TexthoursGridComponent } from './texthours-grid.component';

describe('TexthoursGridComponent', () => {
  let component: TexthoursGridComponent;
  let fixture: ComponentFixture<TexthoursGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TexthoursGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TexthoursGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
