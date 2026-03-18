import { TestBed } from '@angular/core/testing';

import { SlotResizeInteractionService } from '../slot-resize-interaction.service';

describe('SlotResizeInteractionService', () => {
  let service: SlotResizeInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotResizeInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
