import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistShortInfosComponent } from './playlist-short-infos.component';

describe('PlaylistShortInfosComponent', () => {
  let component: PlaylistShortInfosComponent;
  let fixture: ComponentFixture<PlaylistShortInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistShortInfosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistShortInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
