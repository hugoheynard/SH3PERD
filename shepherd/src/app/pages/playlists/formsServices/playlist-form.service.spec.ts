import { TestBed } from '@angular/core/testing';

import { PlaylistFormService } from './playlist-form.service';

describe('PlaylistFormService', () => {
  let service: PlaylistFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
