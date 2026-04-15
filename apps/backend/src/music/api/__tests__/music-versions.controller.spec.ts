import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { MusicVersionsController } from '../music-versions.controller.js';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';
import { PermissionGuard } from '../../../utils/nest/guards/RequirePermission.js';

describe('MusicVersionsController', () => {
  let controller: MusicVersionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicVersionsController],
      providers: [{ provide: CommandBus, useValue: { execute: jest.fn() } }],
    })
      .overrideGuard(ContractContextGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MusicVersionsController>(MusicVersionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
