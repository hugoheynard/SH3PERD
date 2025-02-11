import { TestBed } from '@angular/core/testing';

import { SidenavRightService } from './sidenav-right.service';

describe('SidenavRightService', () => {
  let service: SidenavRightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidenavRightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
