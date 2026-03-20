import { TestBed } from '@angular/core/testing';

import { SlotSelectorService } from '../slot-selector.service';

describe('SlotSelectorService', () => {
  let service: SlotSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
