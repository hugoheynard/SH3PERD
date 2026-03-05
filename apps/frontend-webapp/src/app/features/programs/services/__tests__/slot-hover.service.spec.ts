import { TestBed } from '@angular/core/testing';

import { SlotHoverService } from '../slot-hover.service';

describe('SlotHoverService', () => {
  let service: SlotHoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotHoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
