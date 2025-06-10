import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabNotFoundComponent } from './tab-not-found.component';

describe('TabNotFoundComponent', () => {
  let component: TabNotFoundComponent;
  let fixture: ComponentFixture<TabNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabNotFoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
