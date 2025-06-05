import { Controller, Get, Param } from '@nestjs/common';
import { PlayerRecommandService } from './player-recommand.service';
import { get } from 'http';
import { stringStream } from 'cheerio';

@Controller('player-recommand')
export class PlayerRecommandController {
  constructor(
    private readonly playerRecommandService: PlayerRecommandService,
  ) {}

  // 선수 추천맛집
  @Get('/:staID')
  async getPlayerRecommand(@Param('staID') staID: string) {
    const validStaID = parseInt(staID);
    return await this.playerRecommandService.getPlayerRecommandList(validStaID);
  }
}
