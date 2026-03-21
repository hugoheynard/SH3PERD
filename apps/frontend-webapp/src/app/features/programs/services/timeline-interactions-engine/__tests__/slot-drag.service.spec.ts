import { TestBed } from '@angular/core/testing';

import { SlotDragInteractionService } from '../slot-drag-interaction.service';

describe('SlotDragService', () => {
  let service: SlotDragInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotDragInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
