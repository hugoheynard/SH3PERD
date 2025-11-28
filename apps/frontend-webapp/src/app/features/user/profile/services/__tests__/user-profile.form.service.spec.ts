import { TestBed } from '@angular/core/testing';

import { UserProfileFormService } from '../user-profile.form.service';

describe('UserProfileFormService', () => {
  let service: UserProfileFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfileFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
