import { TestBed } from '@angular/core/testing';

import { TimelineInteractionService } from './timeline-interaction.service';

describe('TimelineInteractionService', () => {
  let service: TimelineInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
