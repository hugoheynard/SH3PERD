import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ContractController } from './contract.controller.js';
import { ContractContextGuard } from './contract-context.guard.js';
import { PermissionGuard } from '../../utils/nest/guards/RequirePermission.js';

describe('ContractController', () => {
  let controller: ContractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    })
      // The controller is now @ContractScoped + @RequirePermission — stub both guards
      .overrideGuard(ContractContextGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContractController>(ContractController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
