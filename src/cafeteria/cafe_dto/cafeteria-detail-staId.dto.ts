import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class CafeteriaListRequestParamDto {
  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    example: '7 : Stadium id 참고',
    description: '노션 백엔드 요청 구장 아이디 문서 참고 (예: 7)',
  })
  sta_Id: string;
}
