import { TestBed } from '@angular/core/testing';

import { SlotDragPreviewService } from '../slot-drag-preview.service';

describe('SlotDragPreviewService', () => {
  let service: SlotDragPreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotDragPreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
