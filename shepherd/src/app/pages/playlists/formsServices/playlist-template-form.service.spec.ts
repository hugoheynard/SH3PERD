import { TestBed } from '@angular/core/testing';

import { PlaylistTemplateFormService } from './playlist-template-form.service';

describe('PlaylistTemplateFormService', () => {
  let service: PlaylistTemplateFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistTemplateFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
