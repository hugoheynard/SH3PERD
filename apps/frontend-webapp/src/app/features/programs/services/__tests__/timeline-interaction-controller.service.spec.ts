import { TestBed } from '@angular/core/testing';

import { TimelineKeyboardController } from '../timeline-keyboard-controller.service';

describe('TimelineInteractionControllerService', () => {
  let service: TimelineKeyboardController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineKeyboardController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
