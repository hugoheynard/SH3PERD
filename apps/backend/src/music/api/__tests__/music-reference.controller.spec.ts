import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MusicReferenceController } from '../music-reference.controller.js';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';
import { PermissionGuard } from '../../../utils/nest/guards/RequirePermission.js';

describe('MusicReferenceController', () => {
  let controller: MusicReferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicReferenceController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(ContractContextGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MusicReferenceController>(MusicReferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
