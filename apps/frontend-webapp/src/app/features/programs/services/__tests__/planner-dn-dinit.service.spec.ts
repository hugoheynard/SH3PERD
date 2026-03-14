import { TestBed } from '@angular/core/testing';

import { PlannerDnDInitService } from '../planner-dn-dinit.service';

describe('PlannerDnDInitService', () => {
  let service: PlannerDnDInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerDnDInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
