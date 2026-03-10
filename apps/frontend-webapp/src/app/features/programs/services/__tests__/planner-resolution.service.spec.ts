import { TestBed } from '@angular/core/testing';

import { PlannerResolutionService } from '../planner-resolution.service';

describe('PlannerResolutionService', () => {
  let service: PlannerResolutionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerResolutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
