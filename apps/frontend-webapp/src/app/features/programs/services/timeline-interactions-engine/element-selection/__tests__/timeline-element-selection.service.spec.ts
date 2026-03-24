import { TestBed } from '@angular/core/testing';

import { TimelineElementSelectionService } from '../timeline-element-selection.service';

describe('TimelineElementSelectionService', () => {
  let service: TimelineElementSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineElementSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
