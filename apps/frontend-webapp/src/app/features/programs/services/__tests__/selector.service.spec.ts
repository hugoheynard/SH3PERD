import { TestBed } from '@angular/core/testing';

import { PlannerSelectorService } from '../selector-layer/planner-selector.service';

describe('SelectorService', () => {
  let service: PlannerSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
