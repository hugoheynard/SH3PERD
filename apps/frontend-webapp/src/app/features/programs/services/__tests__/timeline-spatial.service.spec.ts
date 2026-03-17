import { TestBed } from '@angular/core/testing';

import { TimelineSpatialService } from '../timeline-spatial.service';

describe('TimelineSpatialService', () => {
  let service: TimelineSpatialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineSpatialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
