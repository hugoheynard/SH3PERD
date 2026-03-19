import { TestBed } from '@angular/core/testing';

import { ProgramHistoryService } from '../program-history.service';

describe('ProgramHistoryService', () => {
  let service: ProgramHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
