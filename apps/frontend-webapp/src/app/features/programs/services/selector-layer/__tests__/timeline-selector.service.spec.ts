import { TestBed } from '@angular/core/testing';

import { TimelineSelectorService } from '../timeline-selector.service';

describe('TimelineSelectorService', () => {
  let service: TimelineSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
