import { TestBed } from '@angular/core/testing';

import { InsertLineService } from './insert-line.service';

describe('InsertLineService', () => {
  let service: InsertLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsertLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
