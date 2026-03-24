import { TestBed } from '@angular/core/testing';

import { SlotSelectionService } from '../slot-selection.service';

describe('SlotSelectionService', () => {
  let service: SlotSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
