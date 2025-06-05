import { Body, Controller, Get, Query } from '@nestjs/common';
import { StadiumService } from './stadium.service';

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
}
