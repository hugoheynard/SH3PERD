import { TestBed } from '@angular/core/testing';

import { PlannerDnDInitService } from '../planner-dnd-init.service';

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
