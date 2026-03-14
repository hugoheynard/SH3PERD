import { TestBed } from '@angular/core/testing';

import { DragSessionService } from '../../../../core/drag-and-drop/drag-session.service';

describe('DragSessionService', () => {
  let service: DragSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
