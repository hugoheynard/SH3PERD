import { Test, TestingModule } from '@nestjs/testing';
import { MusicReferenceController } from '../music-reference.controller.js';

describe('MusicReferenceController', () => {
  let controller: MusicReferenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicReferenceController],
    }).compile();

    controller = module.get<MusicReferenceController>(MusicReferenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
