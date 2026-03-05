import { TestBed } from '@angular/core/testing';

import { PointerTrackerService } from '../pointer-tracker.service';

describe('PointerTrackerService', () => {
  let service: PointerTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PointerTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
