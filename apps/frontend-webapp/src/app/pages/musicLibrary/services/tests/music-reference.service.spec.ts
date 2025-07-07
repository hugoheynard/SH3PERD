import { TestBed } from '@angular/core/testing';

import { MusicReferenceService } from '../music-reference.service';

describe('MusicReferenceService', () => {
  let service: MusicReferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicReferenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
