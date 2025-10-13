import { Test, TestingModule } from '@nestjs/testing';
import { EventUnitController } from './event-unit.controller';

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
