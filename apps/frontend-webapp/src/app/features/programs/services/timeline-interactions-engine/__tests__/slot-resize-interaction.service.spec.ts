import { TestBed } from '@angular/core/testing';

import { ResizeInteractionService } from '../resize-interaction.service';

describe('SlotResizeInteractionService', () => {
  let service: ResizeInteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResizeInteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
