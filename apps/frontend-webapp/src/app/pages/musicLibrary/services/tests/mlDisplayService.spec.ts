import { TestBed } from '@angular/core/testing';

import { AddSongTableWindowServiceService } from '../mlDisplayService';

describe('AddSongTableWindowServiceService', () => {
  let service: AddSongTableWindowServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddSongTableWindowServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
