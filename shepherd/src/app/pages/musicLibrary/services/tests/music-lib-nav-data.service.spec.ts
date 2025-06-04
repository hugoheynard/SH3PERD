import { TestBed } from '@angular/core/testing';

import { MusicLibNavDataService } from '../music-lib-nav-data.service';

describe('MusicLibNavDataService', () => {
  let service: MusicLibNavDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicLibNavDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
