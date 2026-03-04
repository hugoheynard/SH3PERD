import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistChipComponent } from './artist-chip.component';

describe('ArtistChipComponent', () => {
  let component: ArtistChipComponent;
  let fixture: ComponentFixture<ArtistChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
