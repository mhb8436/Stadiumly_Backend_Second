import { ApiProperty } from '@nestjs/swagger';

export class GetStadiumDto {
  @ApiProperty({ example: '김신기' })
  sta_id: number;
  @ApiProperty({ example: '잠실야구장-두산' })
  sta_name: string;
  @ApiProperty({ example: '두산' })
  sta_team: string;
  @ApiProperty({ example: '9.213434' })
  sta_lati: number;
  @ApiProperty({ example: '0.24534' })
  sta_long: number;
}
