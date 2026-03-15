import { TestBed } from '@angular/core/testing';

import { DropZoneRegistryService } from '../drop-zone-registry.service';

describe('DropZoneRegistryService', () => {
  let service: DropZoneRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropZoneRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
