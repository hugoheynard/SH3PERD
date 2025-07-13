import { Test, TestingModule } from '@nestjs/testing';
import { MusicVersionsController } from '../music-versions.controller.js';

describe('MusicVersionsController', () => {
  let controller: MusicVersionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicVersionsController],
    }).compile();

    controller = module.get<MusicVersionsController>(MusicVersionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
