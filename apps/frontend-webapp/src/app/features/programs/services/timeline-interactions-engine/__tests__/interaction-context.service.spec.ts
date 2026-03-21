import { TestBed } from '@angular/core/testing';

import { InteractionContextService } from '../interaction-context.service';

describe('InteractionContextService', () => {
  let service: InteractionContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
