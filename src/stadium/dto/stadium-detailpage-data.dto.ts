import { ApiProperty } from '@nestjs/swagger';

export class GetStadiumDetailDto {
  @ApiProperty({
    example: 'http://imageURL',
    description: '선발투수 데이터 받아옴',
  })
  pit_broad_image: string;
  @ApiProperty({ example: '18:30' })
  pit_game_time: string;

  @ApiProperty({ example: '김신기' })
  pit_home_name: string;
  @ApiProperty({ example: '한화' })
  pit_home_team: string;
  @ApiProperty({ example: 'http://imageURL' })
  pit_home_image: string;

  @ApiProperty({ example: '로버트' })
  pit_away_name: string;

  @ApiProperty({ example: '삼성' })
  pit_away_team: string;

  @ApiProperty({ example: 'http://imageURL' })
  pit_away_image: string;

  @ApiProperty({ example: '20250528HHKO0' })
  pit_game_id: string;
}
