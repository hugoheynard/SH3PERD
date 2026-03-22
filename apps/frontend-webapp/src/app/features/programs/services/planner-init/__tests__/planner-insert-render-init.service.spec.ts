import { TestBed } from '@angular/core/testing';

import { PlannerInsertRenderInitService } from '../planner-insert-render-init.service';

describe('PlannerInsertRenderInitService', () => {
  let service: PlannerInsertRenderInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerInsertRenderInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
