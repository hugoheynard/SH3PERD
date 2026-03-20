import { TestBed } from '@angular/core/testing';

import { CueSelectionService } from '../cue-selection.service';

describe('CueSelectionService', () => {
  let service: CueSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CueSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
