import { TestBed } from '@angular/core/testing';

import { RoomLayoutRegistryService } from '../room-layout-registry.service';

describe('RoomLayoutRegistryService', () => {
  let service: RoomLayoutRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomLayoutRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
