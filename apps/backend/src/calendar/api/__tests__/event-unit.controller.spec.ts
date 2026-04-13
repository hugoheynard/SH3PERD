import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EventUnitController } from '../event-unit.controller.js';

describe('EventUnitController', () => {
  let controller: EventUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventUnitController],
    }).compile();

    controller = module.get<EventUnitController>(EventUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
