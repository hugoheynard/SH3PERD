import { TestBed } from '@angular/core/testing';

import { DragPreviewRegistryService } from '../drag-preview-registry.service';

describe('DragPreviewRegistryService', () => {
  let service: DragPreviewRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DragPreviewRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
