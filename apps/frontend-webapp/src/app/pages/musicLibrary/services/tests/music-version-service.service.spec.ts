import { TestBed } from '@angular/core/testing';

import { MusicVersionService } from '../music-version.service';

describe('MusicVersionServiceService', () => {
  let service: MusicVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
