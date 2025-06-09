import { Controller, Param, Get, Query } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('cafeteria')
export class CafeteriaController {
  constructor(private readonly cafeteriaService: CafeteriaService) {}

  @Get(':id')
  @ApiParam({
    name: 'sta_Id',
    description: '노션 백엔드 요청 구장 아이디 문서 참고 (예: 7)',
    example: '7 - 잠실야구장 : Stadium id 참고',
  })
  @ApiQuery({
    name: 'location',
    description: '노션 백엔드 요청 구장 아이디 문서 참고 (예: 3ru)',
    example: '3ru : Stadium location참고',
    required: true,
  })
  async getCafeteriaListById(
    @Param('id') sta_id: string,
    @Query('location') location: string,
  ) {
    console.log('카페테리아 컨트롤렁 : ');
    console.log(sta_id, location);
    return await this.cafeteriaService.getCafeList(sta_id, location);
  }
}
