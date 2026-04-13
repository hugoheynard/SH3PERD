import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserGroupsService } from '../user-groups.service.js';

describe('UserGroupsService', () => {
  let service: UserGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserGroupsService],
    }).compile();

    service = module.get<UserGroupsService>(UserGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
