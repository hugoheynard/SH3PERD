import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertLineComponent } from './insert-line.component';

describe('InsertLineComponent', () => {
  let component: InsertLineComponent;
  let fixture: ComponentFixture<InsertLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
