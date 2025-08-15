import { TestBed } from '@angular/core/testing';

import { MusicReferenceFormService } from '../music-repertoire-entry-form.service';

describe('MusicReferenceFormService', () => {
  let service: MusicReferenceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicReferenceFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
