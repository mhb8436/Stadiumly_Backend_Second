import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class CafeteriaListRequestParamDto {
  @ApiProperty({
    example: '7 - 잠실야구장 : Stadium id 참고',
    description: '노션 백엔드 요청 구장 아이디 문서 참고 (예: 7)',
  })
  @IsString()
  sta_id: string;
}
