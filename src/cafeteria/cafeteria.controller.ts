import { Controller, Param, Get, Query } from '@nestjs/common';
import { CafeteriaService } from './cafeteria.service';
import { CafeteriaListRequestQueryDto } from './cafe_dto/cafeteria-detail-location.dto';
import { CafeteriaListRequestParamDto } from './cafe_dto/cafeteria-detail-staId.dto';

@Controller('cafeteria')
export class CafeteriaController {
  constructor(private readonly cafeteriaService: CafeteriaService) {}

  @Get(':id')
  async getCafeteriaListById(
    @Param('id') stadiumId: CafeteriaListRequestParamDto,
    @Query('location') location: CafeteriaListRequestQueryDto,
  ) {
    return await this.cafeteriaService.getCafeList(
      stadiumId.sta_Id,
      location.location,
    );
  }
}
