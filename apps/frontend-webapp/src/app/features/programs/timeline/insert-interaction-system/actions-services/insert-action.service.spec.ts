import { TestBed } from '@angular/core/testing';

import { InsertActionService } from './insert-action.service';

describe('InsertActionService', () => {
  let service: InsertActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsertActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
