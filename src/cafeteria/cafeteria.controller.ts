import { Controller, Param, Get, Query } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('cafeteria')
export class CafeteriaController {
  constructor(private readonly cafeteriaService: CafeteriaService) {}

  @Get('/:sta_id') // URL 파라미터 경로 추가
  @ApiParam({
    name: 'sta_id',
    description: '구장 아이디, ex: 7',
    required: true,
  })
  @ApiQuery({
    name: 'location',
    description: '구장 내 위치, ex: 3ru',
    required: true,
  })
  async getCafeteriaListById(
    @Param('sta_id') sta_id: string,
    @Query('location') location: string,
  ) {
    return await this.cafeteriaService.getCafeList(sta_id, location);
  }
}
