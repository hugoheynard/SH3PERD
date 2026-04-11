import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { MusicLibraryController } from '../music-library.controller.js';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';
import { PermissionGuard } from '../../../utils/nest/guards/RequirePermission.js';

describe('MusicLibraryController', () => {
  let controller: MusicLibraryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicLibraryController],
      providers: [
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(ContractContextGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MusicLibraryController>(MusicLibraryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
