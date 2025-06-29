import { TestBed } from '@angular/core/testing';

import { MusicVersionFormService } from './music-version-form.service';

describe('MusicVersionFormService', () => {
  let service: MusicVersionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicVersionFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
