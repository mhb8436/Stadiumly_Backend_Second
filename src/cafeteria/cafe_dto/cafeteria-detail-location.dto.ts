import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CafeteriaListRequestQueryDto {
  @IsString()
  @ApiProperty({
    example: '7 : Stadium id 참고',
    description: '노션 백엔드 요청 구장 아이디 문서 참고 (예: 7)',
  })
  location: string;
}
