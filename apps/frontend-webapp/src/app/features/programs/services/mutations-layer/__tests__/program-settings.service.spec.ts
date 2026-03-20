import { TestBed } from '@angular/core/testing';

import { ProgramSettingsService } from '../program-settings.service';

describe('ProgramSettingsService', () => {
  let service: ProgramSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
