// import { Transform } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class CafeteriaListDto {
  @ApiProperty({ example: '와팡' })
  cafe_name: string;
  @ApiProperty({ example: 'http://imagurl' })
  cafe_image: string;
}
