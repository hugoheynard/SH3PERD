import { TestBed } from '@angular/core/testing';

import { InsertActionRegistryService } from './insert-action-registry.service';

describe('InsertActionRegistryService', () => {
  let service: InsertActionRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsertActionRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
