import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteDynamicIconComponent } from './favorite-dynamic-icon.component';

describe('FavoriteDynamicIconComponent', () => {
  let component: FavoriteDynamicIconComponent;
  let fixture: ComponentFixture<FavoriteDynamicIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteDynamicIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteDynamicIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
