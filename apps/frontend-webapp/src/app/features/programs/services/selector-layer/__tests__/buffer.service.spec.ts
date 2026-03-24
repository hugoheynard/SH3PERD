import { TestBed } from '@angular/core/testing';

import { BufferSelectorService } from '../buffer-selector.service';

describe('BufferService', () => {
  let service: BufferSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BufferSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
