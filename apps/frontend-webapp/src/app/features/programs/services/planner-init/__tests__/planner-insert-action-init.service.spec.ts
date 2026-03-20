import { TestBed } from '@angular/core/testing';

import { PlannerInsertActionInitService } from '../planner-insert-action-init.service';

describe('PlannerInsertActionInitService', () => {
  let service: PlannerInsertActionInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerInsertActionInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
