import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicLibraryFiltersComponent } from './music-library-filters.component';

describe('MusicLibraryFiltersComponent', () => {
  let component: MusicLibraryFiltersComponent;
  let fixture: ComponentFixture<MusicLibraryFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicLibraryFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicLibraryFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
