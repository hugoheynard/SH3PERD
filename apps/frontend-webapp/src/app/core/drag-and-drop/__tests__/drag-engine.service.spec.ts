import { TestBed } from '@angular/core/testing';

import { DragEngineService } from '../drag-engine.service';

describe('DragEngineService', () => {
  let service: DragEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
