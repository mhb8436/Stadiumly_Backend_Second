import { Test, TestingModule } from '@nestjs/testing';
import { PlayerRecommandController } from './player-recommand.controller';
import { PlayerRecommandService } from './player-recommand.service';

describe('PlayerRecommandController', () => {
  let controller: PlayerRecommandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerRecommandController],
      providers: [PlayerRecommandService],
    }).compile();

    controller = module.get<PlayerRecommandController>(PlayerRecommandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
