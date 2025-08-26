import { TestBed } from '@angular/core/testing';

import { PlTemplateService } from './pl-template.service';

describe('PlTemplateService', () => {
  let service: PlTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
