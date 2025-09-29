import { TestBed } from '@angular/core/testing';

import { WorkspaceContextService } from '../workspace-context.service';

describe('WorkspaceContextService', () => {
  let service: WorkspaceContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
