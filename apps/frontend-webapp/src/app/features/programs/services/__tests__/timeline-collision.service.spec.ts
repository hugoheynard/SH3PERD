import { TestBed } from '@angular/core/testing';

import { TimelineCollisionService } from '../timeline-collision.service';

describe('TimelineCollisionService', () => {
  let service: TimelineCollisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineCollisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
