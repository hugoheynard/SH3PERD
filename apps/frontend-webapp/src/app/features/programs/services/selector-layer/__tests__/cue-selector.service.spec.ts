import { TestBed } from '@angular/core/testing';

import { CueSelectorService } from '../cue-selector.service';

describe('CueSelectorService', () => {
  let service: CueSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CueSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
