import { Test, TestingModule } from '@nestjs/testing';
import { PlayerRecommandService } from './player-recommand.service';

describe('PlayerRecommandService', () => {
  let service: PlayerRecommandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerRecommandService],
    }).compile();

    service = module.get<PlayerRecommandService>(PlayerRecommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
