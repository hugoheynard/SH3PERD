import { TestBed } from '@angular/core/testing';

import { MusicLibraryTextContentService } from '../music-library-text-content.service';

describe('MusicLibraryTextContentService', () => {
  let service: MusicLibraryTextContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicLibraryTextContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
