import { TestBed } from '@angular/core/testing';

import { SlotDragBuilderService } from '../slot-drag-builder.service';

describe('SlotDragBuilderService', () => {
  let service: SlotDragBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlotDragBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
