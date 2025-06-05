import { TestBed } from '@angular/core/testing';

import { MusiTabConfiguratorFormService } from '../../forms/musicTabConfigurator/services/music-tab-configurator-form.service';

describe('MusiTabConfiguratorFormService', () => {
  let service: MusiTabConfiguratorFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusiTabConfiguratorFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
