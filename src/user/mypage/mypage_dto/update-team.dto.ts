import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateTeamDto {
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '응원하는 팀의 구장 ID. 11은 응원하는 팀 없음',
  })
  user_like_staId: number;
}
