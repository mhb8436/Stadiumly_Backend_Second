import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StadiumService } from './stadium.service';
import { ApiParam } from '@nestjs/swagger';

@Controller('stadium')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  // 구장 이름, 아이디를 받아서 꺼내줘
  // 전부 다 꺼내줌
  @Get()
  async getStadiumList() {
    const homeData = await this.stadiumService.getAllStadium();
    return homeData;
  }
  // @Query('teamname') teamName: string

  @Get('/detail')
  async getStadiumDetailData(@Body('teamname') teamname: string) {
    const data = await this.stadiumService.getStadiumByTeamName(teamname);
    return data;
  }

  @ApiParam({
    name: 'sta_team',
    description: '조회하려는 팀 이름 (예: LG, 두산, 한화 등) ',
    example: 'LG',
  })
  @Post('/startpitcher/:sta_team')
  async getStartPitcherData(@Body('sta_team') sta_team: string) {
    const data = await this.stadiumService.getStartPitcherData(sta_team);
    return data;
  }
}
