import { TestBed } from '@angular/core/testing';

import { PlaylistDisplayService } from '../playlist-display.service';

describe('PlaylistDisplayService', () => {
  let service: PlaylistDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
