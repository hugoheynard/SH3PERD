import { TestBed } from '@angular/core/testing';

import { MusicRepertoireService } from '../../musicLibrary/services/music-repertoire.service';

describe('MusicLibraryService', () => {
  let service: MusicRepertoireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicRepertoireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
