import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UserProfileController } from '../../api/user-profile.controller.js';

describe('UserProfileController', () => {
  let controller: UserProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfileController],
    }).compile();

    controller = module.get<UserProfileController>(UserProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
