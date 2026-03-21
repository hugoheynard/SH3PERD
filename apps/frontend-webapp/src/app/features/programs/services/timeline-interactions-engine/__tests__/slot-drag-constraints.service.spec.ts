import { TestBed } from '@angular/core/testing';

import { SlotDragConstraintsService } from '../slot-drag-constraints.service';

describe('SlotDragConstraintsService', () => {
  let service: SlotDragConstraintsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotDragConstraintsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
