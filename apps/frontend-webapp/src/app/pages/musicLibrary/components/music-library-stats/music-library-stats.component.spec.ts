import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicLibraryStatsComponent } from './music-library-stats.component';

describe('MusicLibraryStatsComponent', () => {
  let component: MusicLibraryStatsComponent;
  let fixture: ComponentFixture<MusicLibraryStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicLibraryStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicLibraryStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
