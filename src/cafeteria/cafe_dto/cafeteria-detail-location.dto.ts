import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class CafeteriaListRequestQueryDto {
  @IsString()
  @Type(() => String)
  @ApiProperty({
    example: '3ru : Stadium location참고',
    description: '노션 백엔드 요청 구장 아이디 문서 참고 (예: 3ru)',
  })
  location: string;
}
