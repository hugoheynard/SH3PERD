import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistWorkloadStripComponent } from './artist-workload-strip.component';

describe('ArtistWorkloadStripComponent', () => {
  let component: ArtistWorkloadStripComponent;
  let fixture: ComponentFixture<ArtistWorkloadStripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistWorkloadStripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtistWorkloadStripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
