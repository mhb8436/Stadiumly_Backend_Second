import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class StadiumDetailRequestDto {
  @ApiProperty({
    example:
      '홈팀이름, Stadium 테이블의 sta_team 컬럼 참고, 두산 | 삼성 | KT | KIA | 키움 | NC | 한화 | SSG | 롯데',
    description: '홈팀이름',
  })
  @IsString()
  team_name: string;
}
